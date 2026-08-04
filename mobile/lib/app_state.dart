import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'services/api_service.dart';
import 'services/firebase_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AppState extends ChangeNotifier {
  final FirebaseService _firebaseService = FirebaseService();
  // Configure this to your backend endpoint that talks to Firebase.
  // For physical phones on Wi-Fi, use your PC's LAN IP (e.g. http://10.219.178.166:5000/api)
  static String get apiBase {
    const envValue = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (envValue.isNotEmpty) {
      return envValue;
    }

    if (kIsWeb) {
      return ApiService.defaultBaseUrlForPlatform(isWeb: true);
    }

    return ApiService.defaultBaseUrlForPlatform(isAndroid: true);
  }

  final ApiService _apiService = ApiService(baseUrl: apiBase);

  String? _token;
  Map<String, dynamic>? _user;
  bool _isOffline = false;
  String? _lastAuthError;

  Map<String, dynamic> _dashboardData = {
    'fatigueScore': 25,
    'fatigueLevel': 'Low',
    'sleepDebt': 1.0,
    'activeCaffeine': 0,
    'recoveryScore': 85,
    'waterIntake': 0,
    'awakeHours': 5.0,
    'lastNightSleep': 7.5,
    'lastSleepQuality': 'Good',
    'driveSafety': {
      'status': 'SAFE',
      'color': '#10B981',
      'advice': 'You are safe to drive. Stay hydrated.',
    },
    'activeShift': null,
  };

  List<dynamic> _goals = [];
  List<dynamic> _notifications = [];
  Map<String, dynamic> _streakInfo = {'streakCount': 0, 'badges': []};
  Map<String, dynamic>? _weeklyReport;

  // Local Offline Database Logs
  Map<String, List<dynamic>> _logs = {
    'sleep': [],
    'caffeine': [],
    'shift': [],
    'nutrition': [],
  };

  bool _isLoading = false;
  bool _isInitialized = false;

  // Getters
  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _token != null;
  bool get isOffline => _isOffline;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  String? get lastAuthError => _lastAuthError;
  Map<String, dynamic> get dashboardData => _dashboardData;
  List<dynamic> get goals => _goals;
  List<dynamic> get notifications => _notifications;
  Map<String, dynamic> get streakInfo => _streakInfo;
  Map<String, dynamic>? get weeklyReport => _weeklyReport;
  Map<String, List<dynamic>> get logs => _logs;

  AppState() {
    _setupAuthListener();
    _loadSession();
  }

  StreamSubscription? _sleepSub;
  StreamSubscription? _caffSub;
  StreamSubscription? _shiftSub;
  StreamSubscription? _nutrSub;
  StreamSubscription? _authSub;

  void _setupAuthListener() {
    _authSub?.cancel();
    _authSub = FirebaseAuth.instance.authStateChanges().listen((firebaseUser) {
      if (firebaseUser != null) {
        final currentUid = firebaseUser.uid;
        if (_user == null) {
          _user = {
            'uid': currentUid,
            'email': firebaseUser.email ?? '',
            'name': firebaseUser.displayName ?? firebaseUser.email?.split('@').first ?? 'Healthcare Worker',
            'role': 'Doctor',
            'profileCompleted': true,
          };
        } else {
          _user!['uid'] = currentUid;
        }
        _initFirestoreListeners();
        notifyListeners();
      }
    });
  }

  void _initFirestoreListeners() {
    _sleepSub?.cancel();
    _caffSub?.cancel();
    _shiftSub?.cancel();
    _nutrSub?.cancel();

    final activeUser = FirebaseAuth.instance.currentUser;
    final String? uid = activeUser?.uid ?? _user?['uid']?.toString();

    if (uid == null || uid.isEmpty) return;

    if (_user != null && _user!['uid'] != uid) {
      _user!['uid'] = uid;
    }

    _sleepSub = _firebaseService.getLogStream(uid: uid, subcollection: 'sleep_logs').listen(
      (snap) {
        final items = snap.docs.map((doc) => {'_id': doc.id, ...doc.data()}).toList();
        _logs['sleep'] = items;
        runOfflineCalculations();
        notifyListeners();
      },
      onError: (err) {
        if (kDebugMode) print('Realtime sleep_logs listener error: $err');
      },
    );

    _caffSub = _firebaseService.getLogStream(uid: uid, subcollection: 'caffeine_logs').listen(
      (snap) {
        final items = snap.docs.map((doc) => {'_id': doc.id, ...doc.data()}).toList();
        _logs['caffeine'] = items;
        runOfflineCalculations();
        notifyListeners();
      },
      onError: (err) {
        if (kDebugMode) print('Realtime caffeine_logs listener error: $err');
      },
    );

    _shiftSub = _firebaseService.getLogStream(uid: uid, subcollection: 'shift_logs').listen(
      (snap) {
        final items = snap.docs.map((doc) => {'_id': doc.id, ...doc.data()}).toList();
        _logs['shift'] = items;
        runOfflineCalculations();
        notifyListeners();
      },
      onError: (err) {
        if (kDebugMode) print('Realtime shift_logs listener error: $err');
      },
    );

    _nutrSub = _firebaseService.getLogStream(uid: uid, subcollection: 'nutrition_logs').listen(
      (snap) {
        final items = snap.docs.map((doc) => {'_id': doc.id, ...doc.data()}).toList();
        _logs['nutrition'] = items;
        runOfflineCalculations();
        notifyListeners();
      },
      onError: (err) {
        if (kDebugMode) print('Realtime nutrition_logs listener error: $err');
      },
    );
  }

  // Save session
  Future<void> _saveSession() async {
    final prefs = await SharedPreferences.getInstance();
    if (_token != null) prefs.setString('guardian_token', _token!);
    if (_user != null) prefs.setString('guardian_user', jsonEncode(_user));
    prefs.setString('guardian_logs', jsonEncode(_logs));
    prefs.setString('guardian_dashboard', jsonEncode(_dashboardData));
    prefs.setString('guardian_notifications', jsonEncode(_notifications));
  }

  // ==========================================
  // AUTHENTICATION APIs
  // ==========================================

  Future<bool> register(
    String name,
    String email,
    String password,
    String role,
    String department,
    String hospital,
  ) async {
    _lastAuthError = null;
    // 1. Try Direct Firebase Authentication & Firestore User Profile creation
    try {
      final creds = await _firebaseService.registerUser(
        email: email,
        password: password,
        name: name,
        role: role,
        department: department,
        hospital: hospital,
      );

      final token = await creds.user?.getIdToken();
      if (creds.user != null) {
        _token = token ?? creds.user!.uid;
        _user = {
          'uid': creds.user!.uid,
          'name': name,
          'email': email,
          'role': role,
          'department': department,
          'hospital': hospital,
        };
        _isOffline = false;
        await _saveSession();
        notifyListeners();
        return true;
      }
    } on FirebaseAuthException catch (e) {
      _lastAuthError = e.message ?? e.code;
      notifyListeners();
      return false;
    } catch (e) {
      // Fallback to API Service backend
      try {
        final data = await _apiService.request(
          '/auth/register',
          method: 'POST',
          body: {
            'name': name,
            'email': email,
            'password': password,
            'role': role,
            'department': department,
            'hospital': hospital,
          },
        );

        if (data.containsKey('token') && data['token'] != null) {
          _token = data['token']?.toString();
          _user = data['user'] is Map<String, dynamic>
              ? data['user'] as Map<String, dynamic>
              : null;
          _isOffline = false;
          await _saveSession();
          notifyListeners();
          return true;
        }

        _lastAuthError =
            data['error']?.toString() ?? 'Registration failed. Please try again.';
        notifyListeners();
        return false;
      } catch (backendError) {
        _lastAuthError =
            'Unable to register. Please check your network connection.';
        notifyListeners();
        return false;
      }
    }

    return false;
  }

  Future<void> sendPhoneOtp({
    required String phoneNumber,
    required Function(String verificationId) onCodeSent,
    required Function(String error) onError,
  }) async {
    _lastAuthError = null;
    await _firebaseService.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      onCodeSent: onCodeSent,
      onAutoCompleted: (creds) async {
        final token = await creds.user?.getIdToken();
        _token = token ?? creds.user?.uid;
        _user = {
          'uid': creds.user?.uid,
          'phoneNumber': creds.user?.phoneNumber ?? phoneNumber,
          'name': creds.user?.displayName ?? 'Healthcare Worker',
          'role': 'Doctor',
          'profileCompleted': true,
        };
        await _saveSession();
        notifyListeners();
      },
      onError: (err) {
        _lastAuthError = err;
        notifyListeners();
        onError(err);
      },
    );
  }

  Future<bool> confirmPhoneOtp({
    required String verificationId,
    required String smsCode,
    String name = '',
    String role = 'Doctor',
    String hospital = '',
    String department = '',
  }) async {
    _lastAuthError = null;
    try {
      final result = await _firebaseService.signInWithPhoneOtp(
        verificationId: verificationId,
        smsCode: smsCode,
        name: name,
        role: role,
        hospital: hospital,
        department: department,
      );

      if (result.containsKey('token')) {
        _token = result['token']?.toString();
        _user = result['user'] is Map<String, dynamic>
            ? result['user'] as Map<String, dynamic>
            : null;
        _isOffline = false;
        await _saveSession();
        notifyListeners();
        return true;
      }
    } on FirebaseAuthException catch (e) {
      _lastAuthError = FirebaseService.mapPhoneAuthError(e);
      notifyListeners();
      return false;
    } catch (e) {
      _lastAuthError = 'OTP verification failed: $e';
      notifyListeners();
      return false;
    }
    return false;
  }

  Future<bool> login(String email, String password) async {
    _lastAuthError = null;
    // Authenticate purely via Firebase — no localhost API fallback
    try {
      final result = await _firebaseService.loginUser(
        email: email,
        password: password,
      );

      if (result.containsKey('token')) {
        _token = result['token']?.toString();
        _user = result['user'] is Map<String, dynamic>
            ? result['user'] as Map<String, dynamic>
            : null;
        _isOffline = false;
        _logs = {
          'sleep': [],
          'caffeine': [],
          'shift': [],
          'nutrition': [],
        };
        await _saveSession();
        _initFirestoreListeners();
        notifyListeners();
        return true;
      }
    } on FirebaseAuthException catch (e) {
      _lastAuthError = _friendlyFirebaseError(e);
      notifyListeners();
      return false;
    } catch (e) {
      // Any other error (e.g. Firestore timeout) — Firebase Auth still succeeded
      // if we are here from loginUser(). Only surface a network error for real issues.
      _lastAuthError = 'Sign-in failed. Please check your connection and try again.';
      notifyListeners();
      return false;
    }

    return false;
  }

  /// Converts FirebaseAuthException codes to user-friendly messages.
  String _friendlyFirebaseError(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No account found with this email.';
      case 'wrong-password':
      case 'invalid-credential':
        return 'Incorrect email or password.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'network-request-failed':
        return 'No internet connection. Please check your network.';
      default:
        return e.message ?? 'Login failed. Please try again.';
    }
  }


  void logout() async {
    _token = null;
    _user = null;
    _lastAuthError = null;
    _sleepSub?.cancel();
    _caffSub?.cancel();
    _shiftSub?.cancel();
    _nutrSub?.cancel();
    _logs = {
      'sleep': [],
      'caffeine': [],
      'shift': [],
      'nutrition': [],
    };
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('guardian_token');
    await prefs.remove('guardian_user');
    await prefs.remove('guardian_logs');
    await prefs.remove('guardian_dashboard');
    await prefs.remove('guardian_notifications');
    try {
      await _firebaseService.signOut();
    } catch (_) {}
    notifyListeners();
  }

  Future<void> updateProfile(Map<String, dynamic> profileData) async {
    if (_user == null) return;
    _user = {..._user!, ...profileData};
    await _saveSession();
    notifyListeners();

    try {
      await _apiService.request(
        '/auth/profile',
        method: 'PUT',
        token: _token,
        body: profileData,
      );
    } on AuthRevokedException {
      logout();
    } catch (e) {
      runOfflineCalculations();
    }
  }

  // ==========================================
  // FETCHERS & CALCS
  // ==========================================

  Future<void> fetchDashboard() async {
    try {
      final data = await _apiService.request(
        '/reports/dashboard',
        method: 'GET',
        token: _token,
      );
      if (data.isNotEmpty && !data.containsKey('error')) {
        _dashboardData = data;
        _isOffline = false;
        notifyListeners();
      }
    } on AuthRevokedException {
      logout();
    } catch (e) {
      runOfflineCalculations();
    }
  }

  Future<void> fetchWeekly() async {
    try {
      final data = await _apiService.request(
        '/reports/weekly',
        method: 'GET',
        token: _token,
      );
      if (data.isNotEmpty && !data.containsKey('error')) {
        _weeklyReport = data;
        _isOffline = false;
        notifyListeners();
      }
    } on AuthRevokedException {
      logout();
    } catch (e) {
      runOfflineCalculations();
    }
  }

  Future<void> fetchGoals() async {
    try {
      final data = await _apiService.request(
        '/goals',
        method: 'GET',
        token: _token,
      );
      if (data.containsKey('data') && data['data'] is List) {
        _goals = data['data'];
      }
      _isOffline = false;
      notifyListeners();
    } on AuthRevokedException {
      logout();
    } catch (e) {
      runOfflineCalculations();
    }
  }

  Future<void> fetchNotifications() async {
    try {
      final data = await _apiService.request(
        '/notifications',
        method: 'GET',
        token: _token,
      );
      if (data.containsKey('data') && data['data'] is List) {
        _notifications = data['data'];
      }
      _isOffline = false;
      notifyListeners();
    } on AuthRevokedException {
      logout();
    } catch (e) {}
  }

  Future<void> fetchStreaks() async {
    try {
      final data = await _apiService.request(
        '/goals/streak',
        method: 'GET',
        token: _token,
      );
      if (data.isNotEmpty && !data.containsKey('error')) {
        _streakInfo = data;
        _isOffline = false;
        notifyListeners();
      }
    } on AuthRevokedException {
      logout();
    } catch (e) {
      runOfflineCalculations();
    }
  }

  // ==========================================
  // LOGGER ACTIONS
  // ==========================================

  Future<void> addLog(String type, Map<String, dynamic> logData) async {
    // Add local log fallback immediately
    final localLog = {
      '_id': 'l_${DateTime.now().millisecondsSinceEpoch}',
      'createdAt': DateTime.now().toIso8601String(),
      'timestamp': DateTime.now().toIso8601String(),
      ...logData,
    };

    if (type == 'sleep') {
      final start = DateTime.parse(logData['startTime']);
      final end = DateTime.parse(logData['endTime']);
      final duration = end.difference(start).inMinutes / 60.0;
      localLog['duration'] = double.parse(duration.toStringAsFixed(2));

      // Calculate sleep recovery score
      double base = 50.0;
      final durDiff = (8.0 - duration).abs();
      if (durDiff < 1.0) {
        base += 25;
      } else if (durDiff < 2.0)
        base += 15;
      if (logData['quality'] == 'Excellent') {
        base += 25;
      } else if (logData['quality'] == 'Good')
        base += 15;
      else if (logData['quality'] == 'Poor')
        base -= 15;
      base -= ((logData['wakeUps'] ?? 0) * 5);
      localLog['recoveryScore'] = base.clamp(0, 100).round();
    }

    _logs[type]!.insert(0, localLog);
    await _saveSession();
    runOfflineCalculations();
    notifyListeners();

    // Write strictly to unified Cloud Firestore subcollection users/{uid}/{type}_logs
    if (_user != null && _user!['uid'] != null) {
      final uid = _user!['uid'].toString();
      final subcollectionMap = {
        'sleep': 'sleep_logs',
        'caffeine': 'caffeine_logs',
        'shift': 'shift_logs',
        'nutrition': 'nutrition_logs',
      };
      final targetSubcollection = subcollectionMap[type];
      if (targetSubcollection != null) {
        _firebaseService.addFirestoreLog(
          uid: uid,
          subcollection: targetSubcollection,
          logData: localLog,
        );
      }
    }

    try {
      final endpoint = type == 'shift' ? 'shift' : type;
      await _apiService.request(
        '/logs/$endpoint',
        method: 'POST',
        token: _token,
        body: logData,
      );
      _isOffline = false;
      fetchDashboard();
      fetchGoals();
      fetchStreaks();
    } on AuthRevokedException {
      logout();
    } catch (e) {
      _isOffline = true;
    }
  }

  // AI Parsing API
  Future<Map<String, dynamic>?> addAILog(String text) async {
    try {
      final data = await _apiService.request(
        '/ai/parse',
        method: 'POST',
        token: _token,
        body: {'text': text},
      ).timeout(const Duration(seconds: 3));
      if (data.isNotEmpty) {
        return data;
      }
    } catch (_) {}

    // Dynamic offline NLP extraction parser
    final norm = text.toLowerCase();
    Map<String, dynamic> result = {
      'sleep': null,
      'caffeine': null,
      'shift': null,
      'nutrition': [],
    };

    // 1. Sleep Parsing
    final sleepDurationMatch = RegExp(
      r'(?:slept|sleep|rested)?\s*(\d+(?:\.\d+)?)\s*(?:hrs|hours|h|hour)\s*(?:of\s*)?(?:sleep|rest)?',
    ).firstMatch(norm);
    if (sleepDurationMatch != null) {
      final duration = double.tryParse(sleepDurationMatch.group(1)!) ?? 7.0;
      final quality = norm.contains('poor') || norm.contains('bad') || norm.contains('restless') || norm.contains('tired')
          ? 'Poor'
          : (norm.contains('deep') || norm.contains('great') || norm.contains('excellent') ? 'Excellent' : 'Good');
      result['sleep'] = {
        'duration': duration,
        'quality': quality,
        'wakeUps': norm.contains('twice') ? 2 : (norm.contains('once') ? 1 : 0),
      };
    }

    // 2. Caffeine Parsing
    int caffCount = 1;
    final countMatch = RegExp(r'(\d+)\s*(?:cups|cups of|servings|glasses|mugs)?\s*(?:coffee|espresso|tea|energy drink|chai)').firstMatch(norm);
    if (countMatch != null) {
      caffCount = int.tryParse(countMatch.group(1)!) ?? 1;
    }

    if (norm.contains('espresso')) {
      result['caffeine'] = {
        'beverage': 'Espresso',
        'count': caffCount,
        'mgAmount': caffCount * 75,
      };
    } else if (norm.contains('energy drink') || norm.contains('red bull') || norm.contains('monster')) {
      result['caffeine'] = {
        'beverage': 'Energy Drink',
        'count': caffCount,
        'mgAmount': caffCount * 80,
      };
    } else if (norm.contains('tea') || norm.contains('chai')) {
      result['caffeine'] = {
        'beverage': 'Tea',
        'count': caffCount,
        'mgAmount': caffCount * 30,
      };
    } else if (norm.contains('coffee') || norm.contains('filter coffee') || norm.contains('cappuccino') || norm.contains('latte')) {
      result['caffeine'] = {
        'beverage': 'Filter Coffee',
        'count': caffCount,
        'mgAmount': caffCount * 95,
      };
    }

    // 3. Shift Parsing
    final shiftDurationMatch = RegExp(
      r'(\d+(?:\.\d+)?)\s*(?:hrs|hours|h|hour)\s*(?:night|day|on-call|rotating)?\s*(?:duty|shift)?',
    ).firstMatch(norm);
    if (norm.contains('shift') || norm.contains('duty') || norm.contains('on-call')) {
      double shiftDuration = 8.0;
      if (shiftDurationMatch != null) {
        shiftDuration = double.tryParse(shiftDurationMatch.group(1)!) ?? 8.0;
      }
      String shiftType = 'Day';
      if (norm.contains('night')) {
        shiftType = 'Night';
      } else if (norm.contains('on-call') || norm.contains('on call')) {
        shiftType = 'On-Call';
      } else if (norm.contains('rotating')) {
        shiftType = 'Rotating';
      }
      result['shift'] = {
        'duration': shiftDuration,
        'shiftType': shiftType,
        'breakDuration': 30,
      };
    }

    // 4. Dynamic Nutrition Parsing with Quantity Multipliers
    final Map<String, Map<String, dynamic>> dishDB = {
      'masala dosa': {'name': 'Masala Dosa', 'c': 250, 'p': 5, 'car': 40, 'f': 8},
      'dosa': {'name': 'Plain Dosa', 'c': 120, 'p': 3, 'car': 22, 'f': 4},
      'idli': {'name': 'Idli', 'c': 60, 'p': 2, 'car': 12, 'f': 1},
      'sambar': {'name': 'Sambar Rice', 'c': 250, 'p': 6, 'car': 45, 'f': 5},
      'chapati': {'name': 'Chapati', 'c': 100, 'p': 3, 'car': 18, 'f': 3},
      'roti': {'name': 'Chapati', 'c': 100, 'p': 3, 'car': 18, 'f': 3},
      'curd rice': {'name': 'Curd Rice', 'c': 200, 'p': 5, 'car': 30, 'f': 6},
      'banana': {'name': 'Banana', 'c': 105, 'p': 1, 'car': 27, 'f': 0},
      'sandwich': {'name': 'Sandwich', 'c': 320, 'p': 12, 'car': 35, 'f': 12},
    };

    dishDB.forEach((key, data) {
      if (norm.contains(key)) {
        int qty = 1;
        final qtyMatch = RegExp('(\\d+)\\s*(?:plates?|pieces?|portions?)?\\s*' + key).firstMatch(norm);
        if (qtyMatch != null) {
          qty = int.tryParse(qtyMatch.group(1)!) ?? 1;
        }

        result['nutrition'].add({
          'foodItem': '$qty x ${data['name']}',
          'calories': (data['c'] as int) * qty,
          'protein': (data['p'] as int) * qty,
          'carbs': (data['car'] as int) * qty,
          'fats': (data['f'] as int) * qty,
        });
      }
    });

    return result;
  }

  /// Dynamic AI Chat response generator using live operator state context
  String getAIChatResponse(String text) {
    final norm = text.toLowerCase();
    final fatigueScore = (_dashboardData['fatigueScore'] as num?)?.toInt() ?? 25;
    final fatigueLevel = _dashboardData['fatigueLevel']?.toString() ?? 'Low';
    final sleepDebt = (_dashboardData['sleepDebt'] as num?)?.toDouble() ?? 1.0;
    final awakeHours = (_dashboardData['awakeHours'] as num?)?.toDouble() ?? 6.0;
    final activeCaffeine = (_dashboardData['activeCaffeine'] as num?)?.toInt() ?? 0;
    final activeShift = _dashboardData['activeShift'] as Map<String, dynamic>?;

    if (norm.contains('drive') || norm.contains('driving') || norm.contains('car') || norm.contains('travel')) {
      if (fatigueScore >= 70) {
        return '🚨 **HIGH FATIGUE WARNING ($fatigueScore/100)**: You are currently evaluated at High Risk. Driving is UNSAFE. You have $sleepDebt hrs sleep debt and have been awake for $awakeHours hrs. Please pull over or rest before driving!';
      } else if (fatigueScore >= 40) {
        return '⚠️ **MODERATE FATIGUE ($fatigueScore/100)**: Drive with CAUTION. Your sleep debt is $sleepDebt hrs. Stay attentive and take regular break breaks if driving long distance.';
      } else {
        return '🟢 **SAFE TO DRIVE ($fatigueScore/100)**: Your current fatigue index is within safe parameters ($fatigueLevel Risk). Drive safely!';
      }
    }

    if (norm.contains('tired') || norm.contains('fatigue') || norm.contains('score') || norm.contains('how am i')) {
      String shiftInfo = activeShift != null ? 'Active Shift: ${activeShift['type']} (${activeShift['impact']} pts burden).' : 'No active shift logged.';
      return '📊 **Current Fatigue Status**:\n- Fatigue Index: **$fatigueScore/100** ($fatigueLevel Risk)\n- Sleep Debt: **${sleepDebt.toStringAsFixed(1)} hrs**\n- Hours Awake: **${awakeHours.toStringAsFixed(1)} hrs**\n- Active Caffeine: **$activeCaffeine mg**\n- $shiftInfo';
    }

    if (norm.contains('coffee') || norm.contains('caffeine') || norm.contains('drink') || norm.contains('tea')) {
      if (activeCaffeine > 350) {
        return '⛔ **Caffeine Threshold Reached**: Your active caffeine level is currently **$activeCaffeine mg** (close to 400 mg daily safety cap). Additional caffeine may cause tremors or sleep disruption. Switch to hydration!';
      } else if (fatigueScore > 50) {
        return '☕ **Caffeine Recommendation**: Your fatigue score is **$fatigueScore/100** and active caffeine is **$activeCaffeine mg**. 1 cup of Coffee (~95 mg) will temporarily improve alertness, but prioritize recovery sleep!';
      } else {
        return '☕ Active caffeine level is **$activeCaffeine mg**. Stay hydrated and maintain your current sleep schedule!';
      }
    }

    if (norm.contains('sleep') || norm.contains('rest') || norm.contains('bed')) {
      return '🛌 **Sleep Analysis**: You currently have **${sleepDebt.toStringAsFixed(1)} hrs** of accumulated sleep debt. We recommend aiming for at least 7.5 to 8 hours of uninterrupted sleep tonight to recover your readiness index.';
    }

    if (norm.contains('hello') || norm.contains('hi') || norm.contains('hey') || norm.contains('who are you')) {
      return 'Hello! I am your Guardian-Sync AI Assistant. I monitor your duty shifts, sleep debt, caffeine intake, and fatigue metrics in real-time. Ask me anything about your readiness or fatigue risk!';
    }

    return '🤖 **Guardian-Sync AI Context**:\nYour current fatigue index is **$fatigueScore/100** ($fatigueLevel Risk) with **$activeCaffeine mg** active caffeine. You can dictate or type your sleep, caffeine, meals, or duty shifts to log them instantly!';
  }

  Future<void> confirmAILog(Map<String, dynamic> parsedPayload) async {
    try {
      await _apiService.request(
        '/ai/confirm',
        method: 'POST',
        token: _token,
        body: parsedPayload,
      );
      _isOffline = false;
      fetchDashboard();
      fetchGoals();
      fetchStreaks();
    } on AuthRevokedException {
      logout();
    } catch (e) {
      _isOffline = true;
      // Perform local insertions
      if (parsedPayload['sleep'] != null) {
        await addLog('sleep', {
          'startTime': DateTime.now()
              .subtract(
                Duration(
                  minutes: (parsedPayload['sleep']['duration'] * 60).round(),
                ),
              )
              .toIso8601String(),
          'endTime': DateTime.now().toIso8601String(),
          'quality': parsedPayload['sleep']['quality'] ?? 'Good',
          'wakeUps': parsedPayload['sleep']['wakeUps'] ?? 0,
        });
      }
      if (parsedPayload['caffeine'] != null) {
        await addLog('caffeine', {
          'beverage': parsedPayload['caffeine']['beverage'] ?? 'Filter Coffee',
          'mgAmount': parsedPayload['caffeine']['mgAmount'],
          'timestamp': DateTime.now().toIso8601String(),
        });
      }
      if (parsedPayload['shift'] != null) {
        await addLog('shift', {
          'startTime': DateTime.now()
              .subtract(
                Duration(
                  minutes: (parsedPayload['shift']['duration'] * 60).round(),
                ),
              )
              .toIso8601String(),
          'endTime': DateTime.now().toIso8601String(),
          'shiftType': parsedPayload['shift']['shiftType'] ?? 'Day',
          'breakDuration': parsedPayload['shift']['breakDuration'] ?? 30,
        });
      }
      if (parsedPayload['nutrition'] != null) {
        for (var meal in parsedPayload['nutrition']) {
          await addLog('nutrition', meal);
        }
      }
    }
  }

  Future<void> updateGoal(String id, int current, bool completed) async {
    _goals = _goals.map((g) {
      if (g['_id'] == id) {
        return {...g, 'currentValue': current, 'completed': completed};
      }
      return g;
    }).toList();
    notifyListeners();

    try {
      await _apiService.request(
        '/goals/$id',
        method: 'PUT',
        token: _token,
        body: {'currentValue': current, 'completed': completed},
      );
    } on AuthRevokedException {
      logout();
    } catch (e) {}
  }

  Future<void> addGoal(String title, String type, int targetValue) async {
    if (_goals.length >= 5) return;
    final newGoal = {
      '_id': 'g_${DateTime.now().millisecondsSinceEpoch}',
      'title': title,
      'type': type,
      'targetValue': targetValue,
      'currentValue': 0,
      'completed': false,
      'isCustom': true,
    };
    _goals.add(newGoal);
    await _saveSession();
    notifyListeners();

    try {
      await _apiService.request(
        '/goals',
        method: 'POST',
        token: _token,
        body: newGoal,
      );
    } on AuthRevokedException {
      logout();
    } catch (e) {}
  }

  Future<void> editGoal(String id, String title, int targetValue) async {
    _goals = _goals.map((g) {
      if (g['_id'] == id) {
        final completed = (g['currentValue'] ?? 0) >= targetValue;
        return {
          ...g,
          'title': title,
          'targetValue': targetValue,
          'completed': completed,
        };
      }
      return g;
    }).toList();
    await _saveSession();
    notifyListeners();

    try {
      await _apiService.request(
        '/goals/$id',
        method: 'PUT',
        token: _token,
        body: {'title': title, 'targetValue': targetValue},
      );
    } on AuthRevokedException {
      logout();
    } catch (e) {}
  }

  Future<void> deleteGoal(String id) async {
    _goals.removeWhere((g) => g['_id'] == id);
    await _saveSession();
    notifyListeners();

    try {
      await _apiService.request(
        '/goals/$id',
        method: 'DELETE',
        token: _token,
      );
    } on AuthRevokedException {
      logout();
    } catch (e) {}
  }

  Future<void> addLogToGoal(String id, int amount) async {
    _goals = _goals.map((g) {
      if (g['_id'] == id) {
        final newVal = (g['currentValue'] ?? 0) + amount;
        final target = g['targetValue'] ?? 1;
        return {...g, 'currentValue': newVal, 'completed': newVal >= target};
      }
      return g;
    }).toList();
    await _saveSession();
    notifyListeners();
  }

  Future<void> applyFatigueSimulation({
    required double sleepDebt,
    required double awakeHours,
    required int activeCaffeine,
    required String shiftType,
  }) async {
    int shiftImpact = 0;
    Map<String, dynamic>? activeShift;

    if (shiftType == 'Night') {
      shiftImpact = 30;
      activeShift = {'type': 'Night', 'duration': 0.0};
    } else if (shiftType == 'On-Call') {
      shiftImpact = 25;
      activeShift = {'type': 'On-Call', 'duration': 0.0};
    } else if (shiftType == 'Rotating') {
      shiftImpact = 20;
      activeShift = {'type': 'Rotating', 'duration': 0.0};
    } else if (shiftType == 'Day') {
      shiftImpact = 10;
      activeShift = {'type': 'Day', 'duration': 0.0};
    }

    final rawFatigue =
        (sleepDebt * 3) +
        (awakeHours * 1.5) +
        shiftImpact -
        (activeCaffeine * 0.15);
    final fatigueScore = rawFatigue.clamp(0.0, 100.0).round();

    String fatigueLevel = 'Low';
    if (fatigueScore >= 80) {
      fatigueLevel = 'Critical';
    } else if (fatigueScore >= 60) {
      fatigueLevel = 'High';
    } else if (fatigueScore >= 40) {
      fatigueLevel = 'Moderate';
    }

    _dashboardData = {
      ..._dashboardData,
      'fatigueScore': fatigueScore,
      'fatigueLevel': fatigueLevel,
      'sleepDebt': double.parse(sleepDebt.toStringAsFixed(1)),
      'awakeHours': double.parse(awakeHours.toStringAsFixed(1)),
      'activeCaffeine': activeCaffeine,
      'activeShift': activeShift,
    };
    await _saveSession();
    notifyListeners();
  }

  Future<void> setAwakeHours(double hours) async {
    _dashboardData['awakeHours'] = double.parse(hours.toStringAsFixed(1));
    if (_logs['sleep']!.isNotEmpty) {
      _logs['sleep']![0]['awakeHours'] = double.parse(hours.toStringAsFixed(1));
    }
    runOfflineCalculations();
    await _saveSession();
    notifyListeners();
  }

  // ==========================================
  // OFFLINE COMPUTATION FALLBACK
  // ==========================================

  DateTime? _parseDateTime(dynamic rawTime) {
    if (rawTime == null) return null;
    if (rawTime is Timestamp) return rawTime.toDate();
    if (rawTime is DateTime) return rawTime;
    if (rawTime is String) return DateTime.tryParse(rawTime);
    return DateTime.tryParse(rawTime.toString());
  }

  void runOfflineCalculations() {
    final sleepGoal = _user != null ? (_user!['sleepGoal'] ?? 8) : 8;
    final now = DateTime.now();

    // 1. Decay Caffeine (5-Hour Half-Life Exponential Decay: active = initial * pow(0.5, t / 5.0))
    double activeCaff = 0;
    for (var log in _logs['caffeine']!) {
      final rawTime = log['timestamp'] ?? log['createdAt'];
      final loggedTime = _parseDateTime(rawTime);
      if (loggedTime == null) continue;
      final double t = now.difference(loggedTime).inMinutes / 60.0;
      if (t >= 0 && t <= 24) {
        final double initialMg = ((log['mgAmount'] ?? log['caffeineMg'] ?? 0) as num).toDouble();
        activeCaff += initialMg * pow(0.5, t / 5.0);
      }
    }
    final int activeCaffeine = activeCaff.round();

    // 2. Sleep Debt
    double sleepDebt = 0;
    if (_logs['sleep']!.isNotEmpty) {
      for (int i = 0; i < 7; i++) {
        final day = now.subtract(Duration(days: i));
        final dayLogs = _logs['sleep']!.where((log) {
          final end = _parseDateTime(log['endTime'] ?? log['timestamp'] ?? log['createdAt']);
          if (end == null) return false;
          return end.year == day.year &&
              end.month == day.month &&
              end.day == day.day;
        });
        if (dayLogs.isNotEmpty) {
          final double totalSlept = dayLogs.fold(
            0.0,
            (sum, log) => sum + (log['duration'] ?? 0),
          );
          sleepDebt += (sleepGoal - totalSlept).clamp(0.0, 8.0);
        }
      }
    } else {
      sleepDebt = 1.0;
    }

    // 3. Awake Hours
    double awakeHours = 6.0;
    int recoveryScore = 85;
    double lastNightSleep = 7.5;
    String lastSleepQuality = 'Good';

    if (_logs['sleep']!.isNotEmpty) {
      final latest = _logs['sleep']![0];
      final endTime = _parseDateTime(latest['endTime'] ?? latest['timestamp'] ?? latest['createdAt']);
      lastNightSleep = (latest['duration'] ?? 7.5).toDouble();
      lastSleepQuality = latest['quality'] ?? 'Good';
      recoveryScore = latest['recoveryScore'] ?? 85;

      if (latest['awakeHours'] != null) {
        awakeHours = (latest['awakeHours'] as num).toDouble();
      } else if (endTime != null) {
        final diff = now.difference(endTime).inMinutes / 60.0;
        if (diff >= 0 && diff <= 48) {
          awakeHours = double.parse(diff.toStringAsFixed(1));
        }
      }
    } else if (_dashboardData['awakeHours'] != null) {
      awakeHours = (_dashboardData['awakeHours'] as num).toDouble();
    }

    // 4. Shift Impact (Day: 10, Rotating: 20, On-Call: 25, Night: 30)
    int shiftImpact = 0;
    Map<String, dynamic>? activeShift;
    final recentShift = _logs['shift']!.isEmpty
        ? null
        : _logs['shift']!.firstWhere((s) {
            final start = _parseDateTime(s['startTime'] ?? s['timestamp'] ?? s['createdAt']);
            final end = _parseDateTime(s['endTime'] ?? s['timestamp'] ?? s['createdAt']);
            if (start == null || end == null) return false;
            final isCurrent = now.isAfter(start) && now.isBefore(end);
            final isRecent = now.isAfter(end) && now.difference(end).inHours <= 24;
            return isCurrent || isRecent;
          }, orElse: () => _logs['shift']!.first);

    if (recentShift != null) {
      final type = recentShift['shiftType']?.toString() ?? 'Day';
      if (type == 'Night') {
        shiftImpact = 30;
      } else if (type == 'On-Call') {
        shiftImpact = 25;
      } else if (type == 'Rotating') {
        shiftImpact = 20;
      } else {
        shiftImpact = 10;
      }

      final start = _parseDateTime(recentShift['startTime'] ?? recentShift['timestamp'] ?? recentShift['createdAt']) ?? now;
      activeShift = {
        'type': type,
        'impact': shiftImpact,
        'startedAt': recentShift['startTime'] ?? start.toIso8601String(),
        'label': '$type Shift (+$shiftImpact Fatigue Impact)',
        'duration': double.parse(
          (now.difference(start).inMinutes / 60.0).clamp(0.0, 24.0).toStringAsFixed(1),
        ),
      };
    }

    // 5. Fatigue Score = min(100, max(0, (Sleep Debt * 3) + (Awake Hours * 1.5) + Shift Impact - Caffeine Deduction))
    final double rawCaffeine = activeCaffeine * 0.15;
    final double accumulatedFatigue =
        (sleepDebt * 3.0) + (awakeHours * 1.5) + shiftImpact;
    // Cap caffeine deduction so it cannot deduct more than 50% of accumulated fatigue
    final double caffeineDeduction =
        min(accumulatedFatigue * 0.5, rawCaffeine);
    final int fatigueScore =
        (accumulatedFatigue - caffeineDeduction).clamp(0.0, 100.0).round();

    String fatigueLevel = 'Low';
    if (fatigueScore >= 80) {
      fatigueLevel = 'Critical';
    } else if (fatigueScore >= 60)
      fatigueLevel = 'High';
    else if (fatigueScore >= 40)
      fatigueLevel = 'Moderate';

    // 6. Safe to drive status
    Map<String, dynamic> driveSafety = {
      'status': 'SAFE',
      'color': '#10B981',
      'advice': 'You are safe to drive. Stay hydrated.',
    };
    if (fatigueScore >= 70 || lastNightSleep < 5 || awakeHours > 18) {
      driveSafety = {
        'status': 'UNSAFE',
        'color': '#EF4444',
        'advice':
            'CRITICAL WARNING: Do NOT drive. Take a rideshare, public transit, or use call rooms.',
      };
    } else if (fatigueScore >= 55 || lastNightSleep < 6.5 || awakeHours >= 15) {
      driveSafety = {
        'status': 'CAUTION',
        'color': '#F59E0B',
        'advice':
            'CAUTION: Slow reaction likelihood. Take a 15-minute power nap before driving.',
      };
    }

    // 7. Water Intake Today
    final waterIntake = _logs['nutrition']!
        .where((n) {
          final logDate = _parseDateTime(n['timestamp'] ?? n['createdAt']);
          if (logDate == null) return false;
          return logDate.year == now.year &&
              logDate.month == now.month &&
              logDate.day == now.day &&
              n['foodItem'].toString().toLowerCase().contains('water');
        })
        .fold(
          0,
          (sum, n) =>
              sum + ((n['volume'] ?? n['calories'] ?? 250) as num).toInt(),
        );

    _dashboardData = {
      'fatigueScore': fatigueScore,
      'fatigueLevel': fatigueLevel,
      'sleepDebt': double.parse(sleepDebt.toStringAsFixed(1)),
      'activeCaffeine': activeCaffeine,
      'recoveryScore': recoveryScore,
      'waterIntake': waterIntake,
      'awakeHours': awakeHours,
      'lastNightSleep': lastNightSleep,
      'lastSleepQuality': lastSleepQuality,
      'driveSafety': driveSafety,
      'activeShift': activeShift,
    };

    // Offline alert triggers
    final List<dynamic> localNotifs = [..._notifications];
    void addOfflineNotif(String notifId, String type, String message) {
      final exists = localNotifs.any(
        (n) =>
            n['_id'] == notifId ||
            (n['type'] == type && n['message'] == message),
      );
      if (!exists) {
        localNotifs.insert(0, {
          '_id': notifId,
          'type': type,
          'message': message,
          'timestamp': DateTime.now().toIso8601String(),
          'read': false,
        });
      }
    }

    if (fatigueScore >= 80) {
      addOfflineNotif(
        'notif_burnout_crit',
        'burnout',
        'Critical warning: Your fatigue is extremely high ($fatigueScore/100). Take rest!',
      );
      addOfflineNotif(
        'notif_drive_crit',
        'drive_warning',
        'Unsafe Drive Alert: Fatigue is critical. Please do NOT drive home.',
      );
    } else if (fatigueScore >= 60) {
      addOfflineNotif(
        'notif_drive_warn',
        'drive_warning',
        'Mild Drive Alert: Fatigue is high ($fatigueScore/100). Exercise caution.',
      );
    }
    _notifications = localNotifs;

    // Generate/Update Goals (preserve custom user-created goals)
    final defaultGoals = [
      {
        '_id': 'g1',
        'title': 'Sleep Duration >= $sleepGoal hrs',
        'type': 'sleep',
        'targetValue': sleepGoal,
        'currentValue': lastNightSleep,
        'completed': lastNightSleep >= sleepGoal,
        'isCustom': false,
      },
      {
        '_id': 'g2',
        'title': 'Caffeine Intake <= 400 mg',
        'type': 'caffeine',
        'targetValue': 400,
        'currentValue': activeCaffeine,
        'completed': activeCaffeine <= 400,
        'isCustom': false,
      },
      {
        '_id': 'g3',
        'title': 'Hydration Intake >= 3000 ml',
        'type': 'water',
        'targetValue': 3000,
        'currentValue': waterIntake,
        'completed': waterIntake >= 3000,
        'isCustom': false,
      },
    ];
    final customGoals = _goals.where((g) => g['isCustom'] == true).toList();
    _goals = [...defaultGoals, ...customGoals];

    // Streaks
    _streakInfo = {
      'streakCount': _logs['sleep']!.length + _logs['caffeine']!.length,
      'badges': [
        {
          'id': 'b1',
          'title': 'First Step',
          'description': 'Started tracking mobile wellness.',
          'icon': '🌱',
          'unlocked': true,
        },
        {
          'id': 'b2',
          'title': 'Sleep Champion',
          'description': 'Logged sleep 3+ times.',
          'icon': '😴',
          'unlocked': _logs['sleep']!.length >= 3,
        },
        {
          'id': 'b3',
          'title': 'Caffeine Commander',
          'description': 'Logged caffeine 5+ times.',
          'icon': '☕',
          'unlocked': _logs['caffeine']!.length >= 5,
        },
      ],
    };
  }

  // Notifications API controls
  Future<void> markNotificationRead(String id) async {
    _notifications = _notifications.map((n) {
      if (n['_id'] == id) return {...n, 'read': true};
      return n;
    }).toList();
    notifyListeners();

    try {
      await _apiService.request(
        '/notifications/$id/read',
        method: 'PUT',
        token: _token,
      );
    } on AuthRevokedException {
      logout();
    } catch (e) {}
  }

  Future<void> markAllNotificationsRead() async {
    _notifications = _notifications.map((n) => {...n, 'read': true}).toList();
    notifyListeners();

    try {
      await _apiService.request(
        '/notifications/read-all',
        method: 'PUT',
        token: _token,
      );
    } on AuthRevokedException {
      logout();
    } catch (e) {}
  }

  Future<void> clearNotifications() async {
    _notifications = [];
    notifyListeners();

    try {
      await _apiService.request(
        '/notifications',
        method: 'DELETE',
        token: _token,
      );
    } on AuthRevokedException {
      logout();
    } catch (e) {}
  }
}
