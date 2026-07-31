import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class BurnoutScreen extends StatelessWidget {
  const BurnoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    if (state.isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Burnout Risk Index'), backgroundColor: const Color(0xFF0C0F20)),
        body: const Center(
          child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
        ),
      );
    }

    final weekly = state.weeklyReport;
    
    // Build 7-day fatigue data safely
    List<Map<String, dynamic>> fatigueTrend = [];
    if (weekly != null && weekly['fatigueTrend'] is List) {
      final list = weekly['fatigueTrend'] as List;
      for (var item in list) {
        if (item is Map) {
          final dayStr = item['day']?.toString() ?? 'Day';
          final numVal = item['score'];
          double score = 0.0;
          if (numVal is num) {
            score = numVal.toDouble();
          } else if (numVal is String) {
            score = double.tryParse(numVal) ?? 0.0;
          }
          fatigueTrend.add({
            'day': dayStr,
            'score': score.clamp(0.0, 100.0),
          });
        }
      }
    }
    
    // Fallback data generation if uninitialized
    if (fatigueTrend.isEmpty) {
      final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      final rawScore = state.dashboardData['fatigueScore'];
      int fatigueScore = 25;
      if (rawScore is num) {
        fatigueScore = rawScore.round();
      }
      for (int i = 0; i < 7; i++) {
        final variation = (i * 7 - 10 + fatigueScore).clamp(0, 100);
        fatigueTrend.add({'day': days[i], 'score': variation.toDouble()});
      }
    }

    final double avgFatigue = fatigueTrend.isNotEmpty
      ? fatigueTrend.fold(0.0, (sum, item) => sum + ((item['score'] as num?)?.toDouble() ?? 0.0)) / fatigueTrend.length
      : 25.0;

    final isBurnoutTriggered = avgFatigue >= 70;

    return Scaffold(
      appBar: AppBar(title: const Text('Burnout Risk Index'), backgroundColor: const Color(0xFF0C0F20)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (isBurnoutTriggered)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, color: Colors.redAccent),
                    SizedBox(width: 8),
                    Expanded(child: Text('BURNOUT WARNING: 7-day fatigue average exceeds 70%. Spaced resting rosters highly advised.', style: TextStyle(fontSize: 12, color: Colors.redAccent))),
                  ],
                ),
              ),
            
            Card(
              color: const Color(0xFF161C36),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Text('Weekly Fatigue Average', style: TextStyle(color: Colors.white54, fontSize: 13)),
                    const SizedBox(height: 8),
                    Text(
                      '${avgFatigue.round()}%',
                      style: TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: isBurnoutTriggered ? Colors.redAccent : const Color(0xFF8B5CF6)),
                    ),
                    const Text('High Risk threshold: 70%', style: TextStyle(color: Colors.white30, fontSize: 10)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // 7-Day Fatigue Trend Bar Chart
            const Text('7-Day Cumulative Burnout Trend', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            Card(
              color: const Color(0xFF161C36),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                child: fatigueTrend.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.all(20),
                        child: Center(
                          child: Text(
                            'No fatigue trend data logged yet.',
                            style: TextStyle(color: Colors.white54),
                          ),
                        ),
                      )
                    : buildClampedBarChart(fatigueTrend),
              ),
            ),
            const SizedBox(height: 24),
            
            const Text('Burnout Preventative Protocols', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            _buildProtocolItem('Circadian Adaptation Gap', 'Observe at least 11 hours of resting separation between shifts.', Icons.timer_outlined),
            _buildProtocolItem('Hydration Saturation', 'Drink 500ml of mineralized water for every cup of coffee logged.', Icons.local_drink),
            _buildProtocolItem('Roster caps', 'Limit schedule rosters to maximum 3 consecutive night-shift duties.', Icons.today_outlined),
          ],
        ),
      ),
    );
  }

  Widget _buildProtocolItem(String title, String desc, IconData icon) {
    return Card(
      color: const Color(0xFF161C36),
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF10B981)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        subtitle: Text(desc, style: const TextStyle(fontSize: 11, color: Colors.white60)),
      ),
    );
  }

  /// Reusable clamped bar chart widget with Y-axis scale capped at 100, Y-axis reference lines, and formatted non-overlapping X-axis labels (Bug #8)
  static Widget buildClampedBarChart(List<Map<String, dynamic>> data) {
    final formattedData = data.map((item) {
      final rawDay = item['day']?.toString() ?? '';
      String dayLabel = rawDay;
      if (rawDay.contains('T')) {
        final dt = DateTime.tryParse(rawDay);
        if (dt != null) {
          dayLabel = '${dt.day}/${dt.month}';
        }
      } else if (rawDay.length > 5) {
        dayLabel = rawDay.substring(0, 3);
      }
      final double score = (item['score'] as num).toDouble().clamp(0.0, 100.0);
      return {'day': dayLabel, 'score': score};
    }).toList();

    return Column(
      children: [
        SizedBox(
          height: 160,
          child: Stack(
            children: [
              // Y-Axis Reference Lines (0, 50, 70 threshold, 100)
              Positioned.fill(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildYLine('100', Colors.white12),
                    _buildYLine('70 Risk', Colors.redAccent.withValues(alpha: 0.3)),
                    _buildYLine('50', Colors.white12),
                    _buildYLine('0', Colors.white12),
                  ],
                ),
              ),
              // Clamped Bar Visuals
              Padding(
                padding: const EdgeInsets.only(left: 36, top: 12, bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: formattedData.map((item) {
                    final double score = item['score'] as double;
                    final double pct = score / 100.0;
                    Color barColor;
                    if (score >= 80) {
                      barColor = const Color(0xFFEF4444);
                    } else if (score >= 60) {
                      barColor = const Color(0xFFF59E0B);
                    } else if (score >= 40) {
                      barColor = const Color(0xFFFBBF24);
                    } else {
                      barColor = const Color(0xFF10B981);
                    }

                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(
                              '${score.round()}',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: barColor,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Container(
                              height: (pct * 115.0).clamp(4.0, 115.0),
                              decoration: BoxDecoration(
                                color: barColor,
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                                boxShadow: [
                                  BoxShadow(
                                    color: barColor.withValues(alpha: 0.3),
                                    blurRadius: 4,
                                    offset: const Offset(0, -2),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        // X-Axis Labels row with offset matching Y-axis
        Padding(
          padding: const EdgeInsets.only(left: 36),
          child: Row(
            children: formattedData.map((item) {
              return Expanded(
                child: Center(
                  child: Text(
                    item['day'] as String,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: Colors.white70,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  static Widget _buildYLine(String label, Color lineCol) {
    return Row(
      children: [
        SizedBox(
          width: 32,
          child: Text(
            label,
            style: const TextStyle(fontSize: 8, color: Colors.white38),
          ),
        ),
        Expanded(
          child: Container(
            height: 1,
            color: lineCol,
          ),
        ),
      ],
    );
  }
}
