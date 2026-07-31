const bcrypt = require('bcryptjs');

const demoEmail = 'demo@guardian.com';
const demoPassword = 'demo123';

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

async function ensureDemoUser(usersCollection) {
  const normalizedEmail = normalizeEmail(demoEmail);
  const hashedPassword = await bcrypt.hash(demoPassword, 10);
  const existing = await usersCollection.findOne({ email: normalizedEmail });

  if (existing) {
    await usersCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          password: hashedPassword,
          name: 'Demo User',
          role: 'Healthcare Worker',
          department: 'General',
          hospital: 'Guardian Sync',
          sleepGoal: 8,
          caffeineLimit: 400,
          waterGoal: 3000,
        },
      },
    );
    return { ...existing, email: normalizedEmail };
  }

  const result = await usersCollection.insertOne({
    name: 'Demo User',
    email: normalizedEmail,
    password: hashedPassword,
    role: 'Healthcare Worker',
    department: 'General',
    hospital: 'Guardian Sync',
    sleepGoal: 8,
    caffeineLimit: 400,
    waterGoal: 3000,
    createdAt: new Date(),
  });

  return { _id: result.insertedId, email: normalizedEmail };
}

module.exports = {
  demoEmail,
  demoPassword,
  normalizeEmail,
  ensureDemoUser,
};
