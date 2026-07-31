import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class SleepAnalyzerScreen extends StatelessWidget {
  const SleepAnalyzerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final data = state.dashboardData;

    final double sleepDebt = (data['sleepDebt'] ?? 0.0).toDouble();
    final double avgDuration = (data['lastNightSleep'] ?? 7.5).toDouble();
    final String lastSleepQuality = data['lastSleepQuality'] ?? 'Good';
    
    // Disruption index calculation
    final int disruptionIndex = sleepDebt > 4.0 ? 75 : (sleepDebt > 2.0 ? 45 : 20);

    return Scaffold(
      appBar: AppBar(title: const Text('Sleep Analyzer'), backgroundColor: const Color(0xFF0C0F20)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              color: const Color(0xFF161C36),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 80,
                          height: 80,
                          child: CircularProgressIndicator(
                            value: disruptionIndex / 100.0,
                            color: disruptionIndex > 50 ? Colors.redAccent : const Color(0xFF8B5CF6),
                            backgroundColor: Colors.white10,
                            strokeWidth: 8,
                          ),
                        ),
                        Text('$disruptionIndex%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Circadian Disruption', style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text(
                            disruptionIndex > 50 
                              ? 'Circadian rhythm split detected. Observe anchors.'
                              : 'Circadian aligned. Maintain consistent sleep.',
                            style: const TextStyle(fontSize: 11, color: Colors.white54, height: 1.35),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Bug #9: Sleep Summary Stats with proper label/value spacing
            const Text('Sleep Summary Stats', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.1,
              children: [
                _buildStatCard(
                  label: 'Avg Sleep Duration',
                  value: '${avgDuration.toStringAsFixed(1)} hrs',
                  subLabel: 'Target: 8 hrs',
                  icon: Icons.hotel_outlined,
                  color: const Color(0xFF8B5CF6),
                ),
                _buildStatCard(
                  label: 'Primary Sleep Quality',
                  value: lastSleepQuality,
                  subLabel: 'Based on ratings',
                  icon: Icons.star_outline,
                  color: const Color(0xFFFBBF24),
                ),
                _buildStatCard(
                  label: 'Cumulative Debt',
                  value: '${sleepDebt.toStringAsFixed(1)} hrs',
                  subLabel: 'Target: 0 hrs',
                  icon: Icons.trending_down,
                  color: sleepDebt > 4.0 ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                ),
                _buildStatCard(
                  label: 'Disruption Index',
                  value: '$disruptionIndex%',
                  subLabel: disruptionIndex > 50 ? 'High risk' : 'Normal range',
                  icon: Icons.nightlight_round,
                  color: disruptionIndex > 50 ? const Color(0xFFEF4444) : const Color(0xFF06B6D4),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String label,
    required String value,
    required String subLabel,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF161C36),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(fontSize: 11, color: Colors.white54, fontWeight: FontWeight.bold),
                ),
              ),
              Icon(icon, size: 16, color: color),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
          ),
          const SizedBox(height: 4),
          Text(
            subLabel,
            style: const TextStyle(fontSize: 10, color: Colors.white38),
          ),
        ],
      ),
    );
  }
}
