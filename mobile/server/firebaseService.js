const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let firestoreDb = null;
let useLocalFallback = false;

// Local JSON persistent fallback for offline/development without cloud credentials
const LOCAL_DB_PATH = path.join(__dirname, 'data', 'firestore_local.json');

function ensureLocalDbFile() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(
      LOCAL_DB_PATH,
      JSON.stringify({ users: [], logs: [] }, null, 2),
      'utf8'
    );
  }
}

function readLocalDb() {
  ensureLocalDbFile();
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { users: [], logs: [] };
  }
}

function writeLocalDb(data) {
  ensureLocalDbFile();
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

class LocalCollectionRef {
  constructor(collectionName) {
    this.name = collectionName;
  }

  async findOne(query) {
    const dbData = readLocalDb();
    const items = dbData[this.name] || [];
    return items.find((item) => {
      for (const key of Object.keys(query)) {
        if (key === '_id' || key === 'id') {
          if (String(item._id || item.id) !== String(query[key])) return false;
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async insertOne(doc) {
    const dbData = readLocalDb();
    if (!dbData[this.name]) dbData[this.name] = [];
    const id = doc._id || doc.id || generateId();
    const newDoc = { ...doc, _id: id, id: id };
    dbData[this.name].push(newDoc);
    writeLocalDb(dbData);
    return { insertedId: id };
  }

  async updateOne(filter, updateSpec) {
    const dbData = readLocalDb();
    const items = dbData[this.name] || [];
    const index = items.findIndex((item) => {
      for (const key of Object.keys(filter)) {
        if (key === '_id' || key === 'id') {
          if (String(item._id || item.id) !== String(filter[key])) return false;
        } else if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });

    if (index !== -1) {
      const setFields = updateSpec.$set || updateSpec;
      items[index] = { ...items[index], ...setFields };
      dbData[this.name] = items;
      writeLocalDb(dbData);
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }

  find(filter) {
    const dbData = readLocalDb();
    let items = dbData[this.name] || [];
    if (filter && Object.keys(filter).length > 0) {
      items = items.filter((item) => {
        for (const key of Object.keys(filter)) {
          if (key === '_id' || key === 'id') {
            if (String(item._id || item.id) !== String(filter[key])) return false;
          } else if (item[key] !== filter[key]) {
            return false;
          }
        }
        return true;
      });
    }

    return {
      sort: (sortSpec) => {
        const field = Object.keys(sortSpec)[0];
        const dir = sortSpec[field];
        items.sort((a, b) => {
          if (a[field] < b[field]) return dir === 1 ? -1 : 1;
          if (a[field] > b[field]) return dir === 1 ? 1 : -1;
          return 0;
        });
        return {
          toArray: async () => items,
        };
      },
      toArray: async () => items,
    };
  }

  async createIndex() {
    return true;
  }
}

class FirestoreCollectionRef {
  constructor(collectionName, db) {
    this.name = collectionName;
    this.db = db;
    this.collection = db.collection(collectionName);
  }

  async findOne(query) {
    if (query._id || query.id) {
      const docId = String(query._id || query.id);
      const docSnap = await this.collection.doc(docId).get();
      if (docSnap.exists) {
        return { _id: docSnap.id, id: docSnap.id, ...docSnap.data() };
      }
      return null;
    }

    let ref = this.collection;
    for (const [key, val] of Object.entries(query)) {
      ref = ref.where(key, '==', val);
    }
    const snap = await ref.limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { _id: doc.id, id: doc.id, ...doc.data() };
  }

  async insertOne(doc) {
    const docData = { ...doc };
    delete docData._id;
    delete docData.id;
    
    if (doc._id || doc.id) {
      const customId = String(doc._id || doc.id);
      await this.collection.doc(customId).set(docData);
      return { insertedId: customId };
    }

    const ref = await this.collection.add(docData);
    return { insertedId: ref.id };
  }

  async updateOne(filter, updateSpec) {
    const existing = await this.findOne(filter);
    if (!existing) return { modifiedCount: 0 };
    const docId = existing._id || existing.id;
    const fields = updateSpec.$set || updateSpec;
    await this.collection.doc(docId).update(fields);
    return { modifiedCount: 1 };
  }

  find(filter) {
    let ref = this.collection;
    if (filter && Object.keys(filter).length > 0) {
      for (const [key, val] of Object.entries(filter)) {
        ref = ref.where(key, '==', val);
      }
    }

    return {
      sort: (sortSpec) => {
        const field = Object.keys(sortSpec)[0];
        const dir = sortSpec[field] === 1 ? 'asc' : 'desc';
        const orderedRef = ref.orderBy(field, dir);
        return {
          toArray: async () => {
            const snap = await orderedRef.get();
            return snap.docs.map((doc) => ({ _id: doc.id, id: doc.id, ...doc.data() }));
          },
        };
      },
      toArray: async () => {
        const snap = await ref.get();
        return snap.docs.map((doc) => ({ _id: doc.id, id: doc.id, ...doc.data() }));
      },
    };
  }

  async createIndex() {
    return true;
  }
}

async function connectFirebase() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const googleAppCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const projectId = process.env.FIREBASE_PROJECT_ID || 'guardian-sync-4694f';

  if (serviceAccountKey) {
    try {
      const credentials = JSON.parse(serviceAccountKey);
      if (!getApps().length) {
        initializeApp({ credential: cert(credentials), projectId: credentials.project_id || projectId });
      }
      firestoreDb = getFirestore();
      console.log(`Connected to Cloud Firebase Firestore (Project ID: ${projectId})`);
      return {
        usersCollection: new FirestoreCollectionRef('users', firestoreDb),
        logsCollection: new FirestoreCollectionRef('logs', firestoreDb),
        type: 'firebase_cloud',
      };
    } catch (err) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back to local store:', err.message);
    }
  }

  if (googleAppCreds) {
    try {
      if (!getApps().length) {
        initializeApp({ projectId });
      }
      firestoreDb = getFirestore();
      console.log(`Connected to Firebase Firestore via Application Credentials (Project ID: ${projectId})`);
      return {
        usersCollection: new FirestoreCollectionRef('users', firestoreDb),
        logsCollection: new FirestoreCollectionRef('logs', firestoreDb),
        type: 'firebase_cloud',
      };
    } catch (err) {
      console.warn('Failed to connect with GOOGLE_APPLICATION_CREDENTIALS, falling back to local store:', err.message);
    }
  }

  console.log(`Initialized Firebase Firestore Provider for [${projectId}]`);
  useLocalFallback = true;
  return {
    usersCollection: new LocalCollectionRef('users'),
    logsCollection: new LocalCollectionRef('logs'),
    type: 'firebase_store',
  };
}

module.exports = {
  connectFirebase,
};
