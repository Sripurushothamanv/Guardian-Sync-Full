import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'app_state.dart';
import 'firebase_options.dart';

// Screens imports
import 'screens/onboarding_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/sleep_screen.dart';
import 'screens/caffeine_screen.dart';
import 'screens/nutrition_screen.dart';
import 'screens/shift_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/fatigue_screen.dart';
import 'screens/safe_to_drive_screen.dart';
import 'screens/burnout_screen.dart';
import 'screens/sleep_analyzer_screen.dart';
import 'screens/recovery_screen.dart';
import 'screens/ai_chat_screen.dart';
import 'screens/weekly_report_screen.dart';
import 'screens/wellness_goals_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/notifications_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppState(),
      child: const GuardianSyncApp(),
    ),
  );
}

class GuardianSyncApp extends StatelessWidget {
  const GuardianSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Guardian-Sync',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF8B5CF6),
        scaffoldBackgroundColor: const Color(0xFF070913),
        cardColor: const Color(0xFF161C36),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF8B5CF6),
          secondary: Color(0xFF06B6D4),
          surface: Color(0xFF161C36),
          error: Color(0xFFEF4444),
        ),
        fontFamily: 'Outfit',
        useMaterial3: true,
      ),
      home: const AuthGate(),
      routes: {
        '/onboarding': (context) => const OnboardingScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/forgot-password': (context) => const ForgotPasswordScreen(),
        '/dashboard': (context) => const NavShell(),
        '/sleep': (context) => const SleepScreen(),
        '/caffeine': (context) => const CaffeineScreen(),
        '/nutrition': (context) => const NutritionScreen(),
        '/shifts': (context) => const ShiftScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/fatigue': (context) => const FatigueScreen(),
        '/drive-safety': (context) => const SafeToDriveScreen(),
        '/burnout': (context) => const BurnoutScreen(),
        '/sleep-analyzer': (context) => const SleepAnalyzerScreen(),
        '/recovery': (context) => const RecoveryScreen(),
        '/ai-chat': (context) => const AIChatScreen(),
        '/reports': (context) => const WeeklyReportScreen(),
        '/goals': (context) => const WellnessGoalsScreen(),
        '/settings': (context) => const SettingsScreen(),
        '/notifications': (context) => const NotificationsScreen(),
      },
    );
  }
}

/// Dynamic root gate checking stored auth state on startup.
/// Bypasses Onboarding/LoginScreen when a valid saved session exists.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    if (!state.isInitialized) {
      return const Scaffold(
        backgroundColor: Color(0xFF070913),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
        ),
      );
    }

    if (state.isAuthenticated) {
      return const NavShell();
    }

    return const OnboardingScreen();
  }
}

// Shell wrapper coordinating the navigation drawers and tabs
class NavShell extends StatefulWidget {
  const NavShell({super.key});

  @override
  State<NavShell> createState() => _NavShellState();
}

class _NavShellState extends State<NavShell> {
  int _currentIndex = 0;

  final List<Widget> _tabs = [
    const DashboardScreen(),
    const SleepScreen(),
    const AIChatScreen(),
    const CaffeineScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    if (!state.isInitialized) {
      return const Scaffold(
        backgroundColor: Color(0xFF070913),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
        ),
      );
    }

    if (!state.isAuthenticated) {
      return const LoginScreen();
    }

    final unreadCount = state.notifications.where((n) => n['read'] == false).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'GUARDIAN-SYNC',
          style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.0, fontSize: 18),
        ),
        centerTitle: false,
        backgroundColor: const Color(0xFF0C0F20),
        elevation: 0,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_outlined),
                onPressed: () => Navigator.pushNamed(context, '/notifications'),
              ),
              if (unreadCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '$unreadCount',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                )
            ],
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => Navigator.pushNamed(context, '/settings'),
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: const Color(0xFF0C0F20),
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(
                color: Color(0xFF161C36),
              ),
              currentAccountPicture: CircleAvatar(
                backgroundColor: const Color(0xFF8B5CF6),
                child: Text(
                  state.user?['name']?.substring(0, 1).toUpperCase() ?? 'U',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              accountName: Text(state.user?['name'] ?? 'User'),
              accountEmail: Text(state.user?['role'] ?? 'Healthcare Worker'),
            ),
            ListTile(
              leading: const Icon(Icons.dashboard_outlined),
              title: const Text('Dashboard'),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 0);
              },
            ),
            ListTile(
              leading: const Icon(Icons.hotel_outlined),
              title: const Text('Sleep Logs'),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 1);
              },
            ),
            ListTile(
              leading: const Icon(Icons.coffee_outlined),
              title: const Text('Caffeine Track'),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 3);
              },
            ),
            ListTile(
              leading: const Icon(Icons.restaurant_outlined),
              title: const Text('Nutrition & Macros'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/nutrition');
              },
            ),
            ListTile(
              leading: const Icon(Icons.today_outlined),
              title: const Text('Shift Roster'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/shifts');
              },
            ),
            const Divider(color: Colors.white10),
            ListTile(
              leading: const Icon(Icons.psychology_outlined, color: Color(0xFF8B5CF6)),
              title: const Text('Fatigue Meter'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/fatigue');
              },
            ),
            ListTile(
              leading: const Icon(Icons.directions_car_outlined, color: Color(0xFF06B6D4)),
              title: const Text('Drive Safety Check'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/drive-safety');
              },
            ),
            ListTile(
              leading: const Icon(Icons.shield_outlined, color: Colors.redAccent),
              title: const Text('Burnout Risk Index'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/burnout');
              },
            ),
            ListTile(
              leading: const Icon(Icons.bar_chart_outlined, color: Colors.orangeAccent),
              title: const Text('Sleep Analyzer'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/sleep-analyzer');
              },
            ),
            ListTile(
              leading: const Icon(Icons.local_fire_department_outlined, color: Colors.amber),
              title: const Text('Recovery suggestions'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/recovery');
              },
            ),
            const Divider(color: Colors.white10),
            ListTile(
              leading: const Icon(Icons.chat_bubble_outline_outlined, color: Color(0xFF06B6D4)),
              title: const Text('AI Voice Assistant'),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 2);
              },
            ),
            ListTile(
              leading: const Icon(Icons.summarize_outlined),
              title: const Text('Weekly Summary'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/reports');
              },
            ),
            ListTile(
              leading: const Icon(Icons.military_tech_outlined, color: Colors.amber),
              title: const Text('Wellness Goals'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/goals');
              },
            ),
            const Divider(color: Colors.white10),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: const Text('Logout'),
              onTap: () {
                Navigator.pop(context);
                state.logout();
              },
            ),
          ],
        ),
      ),
      body: _tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        backgroundColor: const Color(0xFF0C0F20),
        selectedItemColor: const Color(0xFF8B5CF6),
        unselectedItemColor: Colors.white38,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.hotel_outlined), label: 'Sleep'),
          BottomNavigationBarItem(
            icon: CircleAvatar(
              backgroundColor: Color(0xFF8B5CF6),
              radius: 18,
              child: Icon(Icons.chat_bubble_outline, size: 18, color: Colors.white),
            ),
            label: 'AI Chat',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.coffee_outlined), label: 'Caffeine'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}
