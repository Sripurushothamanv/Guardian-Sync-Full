import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class FirebaseService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  FirebaseAuth get auth => _auth;
  FirebaseFirestore get db => _db;

  User? get currentUser => _auth.currentUser;

  /// Register user with FirebaseAuth and create profile document in Firestore
  Future<UserCredential> registerUser({
    required String email,
    required String password,
    required String name,
    required String role,
    String? department,
    String? hospital,
  }) async {
    final userCredential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );

    final user = userCredential.user;
    if (user != null) {
      // Update display name
      await user.updateDisplayName(name);

      // Create user document in Cloud Firestore under users/{uid}
      // Non-blocking: if Firestore fails, auth still succeeds
      try {
        await _db.collection('users').doc(user.uid).set({
          'uid': user.uid,
          'name': name,
          'email': email,
          'role': role,
          'department': department ?? '',
          'hospital': hospital ?? '',
          'createdAt': FieldValue.serverTimestamp(),
          'updatedAt': FieldValue.serverTimestamp(),
        }).timeout(const Duration(seconds: 10));
      } catch (_) {
        // Firestore write failure is non-fatal; auth succeeded
      }
    }

    return userCredential;
  }

  /// Sign in user with FirebaseAuth and fetch user profile from Firestore.
  /// Firestore profile fetch is optional — auth token is always returned
  /// so a Firestore error will NOT prevent the user from logging in.
  Future<Map<String, dynamic>> loginUser({
    required String email,
    required String password,
  }) async {
    final userCredential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );

    final user = userCredential.user;
    if (user == null) {
      throw FirebaseAuthException(
        code: 'user-not-found',
        message: 'User authentication failed.',
      );
    }

    // Base user data from Firebase Auth (always available, no network required after auth)
    Map<String, dynamic> userData = {
      'uid': user.uid,
      'name': user.displayName ?? email.split('@').first,
      'email': user.email ?? email,
      'role': 'Healthcare Worker',
    };

    // Try to enrich with Firestore profile — gracefully degrade if unavailable
    try {
      final docSnapshot = await _db
          .collection('users')
          .doc(user.uid)
          .get()
          .timeout(const Duration(seconds: 8));
      if (docSnapshot.exists && docSnapshot.data() != null) {
        userData.addAll(docSnapshot.data()!);
      }
    } catch (_) {
      // Firestore unavailable (offline or slow): proceed with Firebase Auth data only
    }

    // Always get a fresh token — this uses Firebase's cached token, no extra network call
    final token = await user.getIdToken();

    return {
      'token': token,
      'user': userData,
    };
  }

  /// Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }
}
