import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class SafeToDriveScreen extends StatelessWidget {
  const SafeToDriveScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final data = state.dashboardData;
    final Map<String, dynamic> driveSafety = data['driveSafety'] ?? {
      'status': 'SAFE',
      'color': '#10B981',
      'advice': 'Safe to drive.'
    };

    final int fatigueScore = data['fatigueScore'] ?? 0;
    final double lastNightSleep = (data['lastNightSleep'] ?? 7.5).toDouble();
    final double awakeHours = (data['awakeHours'] ?? 0.0).toDouble();

    Color driveColor = const Color(0xFF10B981);
    if (driveSafety['color'] == '#EF4444') driveColor = const Color(0xFFEF4444);
    if (driveSafety['color'] == '#F59E0B') driveColor = const Color(0xFFF59E0B);

    final String status = driveSafety['status'] ?? 'SAFE';

    return Scaffold(
      appBar: AppBar(title: const Text('Safe-To-Drive Check'), backgroundColor: const Color(0xFF0C0F20)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. System Rating Card
            Card(
              color: const Color(0xFF161C36),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: driveColor.withValues(alpha: 0.3), width: 1.5),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Icon(
                      status == 'SAFE'
                          ? Icons.check_circle_outline
                          : status == 'CAUTION'
                              ? Icons.warning_amber_rounded
                              : Icons.dangerous_outlined,
                      size: 48,
                      color: driveColor,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      status,
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: driveColor, letterSpacing: 2),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      driveSafety['advice'] ?? '',
                      style: const TextStyle(fontSize: 13, color: Colors.white70, height: 1.4),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // 2. Readiness Parameters Check
            const Text('Readiness Parameters', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            _buildReadinessParam(
              'Predicted Fatigue Index',
              '$fatigueScore / 100',
              fatigueScore < 55 ? 'PASS' : fatigueScore < 70 ? 'CAUTION' : 'FAIL',
              fatigueScore < 55 ? const Color(0xFF10B981) : fatigueScore < 70 ? const Color(0xFFF59E0B) : const Color(0xFFEF4444),
              Icons.psychology_outlined,
            ),
            _buildReadinessParam(
              'Sleep Last Session',
              '${lastNightSleep.toStringAsFixed(1)} hrs',
              lastNightSleep >= 6.5 ? 'PASS' : lastNightSleep >= 5 ? 'CAUTION' : 'FAIL',
              lastNightSleep >= 6.5 ? const Color(0xFF10B981) : lastNightSleep >= 5 ? const Color(0xFFF59E0B) : const Color(0xFFEF4444),
              Icons.hotel_outlined,
            ),
            _buildReadinessParam(
              'Duration Awake',
              '${awakeHours.toStringAsFixed(1)} hrs',
              awakeHours < 15 ? 'PASS' : awakeHours < 18 ? 'CAUTION' : 'FAIL',
              awakeHours < 15 ? const Color(0xFF10B981) : awakeHours < 18 ? const Color(0xFFF59E0B) : const Color(0xFFEF4444),
              Icons.access_time,
            ),
            const SizedBox(height: 20),

            // 3. Three-Tier Result Banner
            const Text('Result Tiers', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            _buildTierBanner(
              'SAFE',
              'All readiness parameters within safe range. You are cleared to drive.',
              const Color(0xFF10B981),
              Icons.check_circle,
              status == 'SAFE',
            ),
            _buildTierBanner(
              'MILD CAUTION',
              'One or more parameters are borderline. Take a 15-minute power nap before driving.',
              const Color(0xFFF59E0B),
              Icons.warning_amber,
              status == 'CAUTION',
            ),
            _buildTierBanner(
              'UNSAFE',
              'Critical fatigue detected. Do NOT drive. Use a rideshare, public transit, or call rooms.',
              const Color(0xFFEF4444),
              Icons.dangerous,
              status == 'UNSAFE',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReadinessParam(String label, String value, String result, Color resultColor, IconData icon) {
    return Card(
      color: const Color(0xFF161C36),
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Icon(icon, color: resultColor, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 12, color: Colors.white54, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: resultColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: resultColor.withValues(alpha: 0.3)),
              ),
              child: Text(result, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: resultColor)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTierBanner(String tier, String desc, Color color, IconData icon, bool isActive) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isActive ? color.withValues(alpha: 0.1) : const Color(0xFF161C36),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isActive ? color.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.04),
          width: isActive ? 1.5 : 1,
        ),
      ),
      child: Row(
        children: [
          Icon(icon, color: isActive ? color : Colors.white24, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tier, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isActive ? color : Colors.white38)),
                const SizedBox(height: 2),
                Text(desc, style: TextStyle(fontSize: 11, color: isActive ? Colors.white70 : Colors.white24, height: 1.3)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
