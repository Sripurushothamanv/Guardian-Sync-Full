import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class FirebaseService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  FirebaseAuth get auth => _auth;
  FirebaseFirestore get db => _db;

  User? get currentUser => _auth.currentUser;

  /// E.164 Phone Sanitizer: automatically prefixes +91 to raw 10-digit mobile numbers
  static String sanitizePhoneNumber(String rawPhone) {
    String clean = rawPhone.trim().replaceAll(RegExp(r'[\s\-\(\)]'), '');
    if (!clean.startsWith('+')) {
      clean = '+91$clean';
    }
    return clean;
  }

  /// Maps FirebaseAuthException codes to user-friendly messages
  static String mapPhoneAuthError(FirebaseAuthException e) {
    switch (e.code) {
      case 'invalid-phone-number':
        return 'The mobile number format is invalid. Please enter a valid 10-digit number or include country code (e.g. +919876543210).';
      case 'quota-exceeded':
        return 'SMS quota exceeded for today. Please use email login or try test numbers.';
      case 'app-not-verified':
        return 'App verification failed. Ensure SHA-1/SHA-256 fingerprints are added to Firebase Console.';
      case 'captcha-check-failed':
        return 'reCAPTCHA verification failed. Please try again.';
      case 'too-many-requests':
        return 'Too many SMS requests. Please try again later.';
      case 'invalid-verification-code':
        return 'The OTP verification code is incorrect. Please check and re-enter.';
      case 'session-expired':
        return 'The OTP session has expired. Please request a new OTP code.';
      default:
        return e.message ?? 'Phone authentication failed. Code: ${e.code}';
    }
  }

  /// Send Phone OTP SMS using Firebase verifyPhoneNumber
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) onCodeSent,
    required Function(UserCredential creds) onAutoCompleted,
    required Function(String errorMessage) onError,
  }) async {
    final sanitizedNumber = sanitizePhoneNumber(phoneNumber);

    try {
      await _auth.verifyPhoneNumber(
        phoneNumber: sanitizedNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          try {
            final userCred = await _auth.signInWithCredential(credential);
            onAutoCompleted(userCred);
          } catch (e) {
            onError('Auto verification sign-in failed.');
          }
        },
        verificationFailed: (FirebaseAuthException e) {
          onError(mapPhoneAuthError(e));
        },
        codeSent: (String verificationId, int? resendToken) {
          onCodeSent(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) {},
        timeout: const Duration(seconds: 60),
      );
    } on FirebaseAuthException catch (e) {
      onError(mapPhoneAuthError(e));
    } catch (e) {
      onError('Unable to request OTP: $e');
    }
  }

  /// Verify OTP SMS code and sign in
  Future<Map<String, dynamic>> signInWithPhoneOtp({
    required String verificationId,
    required String smsCode,
    String name = '',
    String role = 'Doctor',
    String hospital = '',
    String department = '',
  }) async {
    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode.trim(),
    );

    final userCredential = await _auth.signInWithCredential(credential);
    final user = userCredential.user;

    if (user == null) {
      throw FirebaseAuthException(
        code: 'user-not-found',
        message: 'Phone authentication failed.',
      );
    }

    if (name.isNotEmpty) {
      await user.updateDisplayName(name);
    }

    final userData = {
      'uid': user.uid,
      'name': name.isNotEmpty ? name : (user.displayName ?? 'Healthcare Worker'),
      'phoneNumber': user.phoneNumber ?? '',
      'email': user.email ?? '',
      'role': role,
      'hospital': hospital,
      'department': department,
      'profileCompleted': true,
      'updatedAt': FieldValue.serverTimestamp(),
    };

    try {
      await _db.collection('users').doc(user.uid).set(userData, SetOptions(merge: true));
    } catch (_) {}

    final token = await user.getIdToken();

    return {
      'token': token,
      'user': userData,
    };
  }

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
      await user.updateDisplayName(name);

      try {
        await _db.collection('users').doc(user.uid).set({
          'uid': user.uid,
          'name': name,
          'email': email,
          'role': role,
          'department': department ?? '',
          'hospital': hospital ?? '',
          'profileCompleted': true,
          'createdAt': FieldValue.serverTimestamp(),
          'updatedAt': FieldValue.serverTimestamp(),
        }).timeout(const Duration(seconds: 10));
      } catch (_) {}
    }

    return userCredential;
  }

  /// Sign in user with FirebaseAuth and fetch user profile from Firestore.
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

    Map<String, dynamic> userData = {
      'uid': user.uid,
      'name': user.displayName ?? email.split('@').first,
      'email': user.email ?? email,
      'role': 'Doctor',
      'profileCompleted': true,
    };

    try {
      final docSnapshot = await _db
          .collection('users')
          .doc(user.uid)
          .get()
          .timeout(const Duration(seconds: 8));
      if (docSnapshot.exists && docSnapshot.data() != null) {
        userData.addAll(docSnapshot.data()!);
        userData['profileCompleted'] = true;
      }
    } catch (_) {}

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
