import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Color _getFatigueColor(int score) {
    if (score >= 80) return const Color(0xFFEF4444); // Red
    if (score >= 60) return const Color(0xFFF59E0B); // Orange
    if (score >= 40) return const Color(0xFFFBBF24); // Yellow
    return const Color(0xFF10B981); // Green
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final data = state.dashboardData;
    final user = state.user;

    final int fatigueScore = data['fatigueScore'] ?? 0;
    final String fatigueLevel = data['fatigueLevel'] ?? 'Low';
    final double sleepDebt = (data['sleepDebt'] ?? 0.0).toDouble();
    final int activeCaffeine = data['activeCaffeine'] ?? 0;
    final int recoveryScore = data['recoveryScore'] ?? 75;
    final int waterIntake = data['waterIntake'] ?? 0;
    final Map<String, dynamic> driveSafety = data['driveSafety'] ?? {
      'status': 'SAFE',
      'color': '#10B981',
      'advice': 'Safe'
    };

    final Color primaryColor = _getFatigueColor(fatigueScore);
    
    // Parse color hex from backend string
    Color driveColor = const Color(0xFF10B981);
    if (driveSafety['color'] == '#EF4444') driveColor = const Color(0xFFEF4444);
    if (driveSafety['color'] == '#F59E0B') driveColor = const Color(0xFFF59E0B);

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Welcome
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hello, ${user?['name']?.split(' ')[0] ?? 'Doctor'}',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                    Text(
                      '${user?['role'] ?? 'General'} | ${user?['department'] ?? 'ICU'}',
                      style: const TextStyle(fontSize: 12, color: Colors.white54),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => Navigator.pushNamed(context, '/ai-chat'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF06B6D4).withValues(alpha: 0.1),
                      border: Border.all(color: const Color(0xFF06B6D4).withValues(alpha: 0.3)),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.auto_awesome, color: Color(0xFF06B6D4), size: 14),
                        SizedBox(width: 4),
                        Text('AI Log', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // 1. Safe-to-Drive Warning Banner
            Card(
              color: const Color(0xFF161C36),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: driveColor.withValues(alpha: 0.3), width: 1.5),
              ),
              child: Container(
                decoration: BoxDecoration(
                  border: Border(left: BorderSide(color: driveColor, width: 6)),
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      backgroundColor: driveColor.withValues(alpha: 0.1),
                      child: Icon(Icons.directions_car, color: driveColor),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'DRIVE SAFETY: ',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white60),
                              ),
                              Text(
                                '${driveSafety['status']}',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: driveColor),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            driveSafety['advice'] ?? '',
                            style: const TextStyle(fontSize: 12, color: Colors.white70, height: 1.35),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white30),
                      onPressed: () => Navigator.pushNamed(context, '/drive-safety'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Giant Fatigue score painter + Quick Actions Grid
            Row(
              children: [
                // Circular Gauge
                Expanded(
                  flex: 5,
                  child: Card(
                    color: const Color(0xFF161C36),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 8),
                      child: Column(
                        children: [
                          const Align(
                            alignment: Alignment.centerLeft,
                            child: Padding(
                              padding: EdgeInsets.only(left: 8),
                              child: Text('Fatigue Score', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white60)),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                width: 100,
                                height: 100,
                                child: CustomPaint(
                                  painter: FatigueCircularPainter(fatigueScore, primaryColor),
                                ),
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '$fatigueScore',
                                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white),
                                  ),
                                  Text(
                                    fatigueLevel,
                                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: primaryColor),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Score: $fatigueScore/100',
                            style: const TextStyle(fontSize: 11, color: Colors.white30),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Quick Logger Actions
                Expanded(
                  flex: 6,
                  child: Column(
                    children: [
                      Row(
                        children: [
                          _buildQuickAction(context, 'Sleep', Icons.hotel_outlined, const Color(0xFF8B5CF6), '/sleep'),
                          const SizedBox(width: 8),
                          _buildQuickAction(context, 'Caffeine', Icons.coffee_outlined, const Color(0xFF06B6D4), '/caffeine'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          _buildQuickAction(context, 'Nutrition', Icons.restaurant_outlined, const Color(0xFF10B981), '/nutrition'),
                          const SizedBox(width: 8),
                          _buildQuickAction(context, 'Shifts', Icons.today_outlined, const Color(0xFFF59E0B), '/shifts'),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Health parameters grid
            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.2,
              children: [
                _buildMetricCard('Sleep Debt', '$sleepDebt hrs', 'Last 7 days', Icons.hotel_outlined, const Color(0xFF8B5CF6)),
                _buildMetricCard('Active Caffeine', '$activeCaffeine mg', 'Curfew checks', Icons.coffee_outlined, const Color(0xFF06B6D4)),
                _buildHydrationMetricCard(state, waterIntake, user?['waterGoal'] ?? 3000),
                _buildMetricCard('Last Sleep Recovery', '$recoveryScore%', 'Session score', Icons.bolt, const Color(0xFFFBBF24)),
              ],
            ),
            const SizedBox(height: 20),

            // Active Shift Card
            Card(
              color: const Color(0xFF161C36),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Active Roster Tracking', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 12),
                    data['activeShift'] != null
                      ? Row(
                          children: [
                            const Icon(Icons.access_time, color: Color(0xFFF59E0B)),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Working ${data['activeShift']['type']} Shift', style: const TextStyle(fontWeight: FontWeight.bold)),
                                Text('Elapsed: ${data['activeShift']['duration']} hours', style: const TextStyle(fontSize: 12, color: Colors.white54)),
                              ],
                            ),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('No active duty shift logged.', style: TextStyle(color: Colors.white54, fontSize: 13)),
                            ElevatedButton(
                              onPressed: () => Navigator.pushNamed(context, '/shifts'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFF59E0B),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                              ),
                              child: const Text('Log Shift', style: TextStyle(fontSize: 12)),
                            ),
                          ],
                        ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, String label, IconData icon, Color color, String route) {
    return Expanded(
      child: GestureDetector(
        onTap: () => Navigator.pushNamed(context, route),
        child: Container(
          height: 72,
          decoration: BoxDecoration(
            color: const Color(0xFF161C36),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: color.withValues(alpha: 0.1),
                child: Icon(icon, size: 16, color: color),
              ),
              const SizedBox(height: 4),
              Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, String desc, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF161C36),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: Colors.white54, fontWeight: FontWeight.w600)),
              Icon(icon, size: 16, color: color),
            ],
          ),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
          Text(desc, style: const TextStyle(fontSize: 10, color: Colors.white38)),
        ],
      ),
    );
  }

  Widget _buildHydrationMetricCard(AppState state, int waterIntake, int target) {
    final double pct = (waterIntake / target).clamp(0.0, 1.0);
    return Card(
      color: const Color(0xFF161C36),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Hydration Today', style: TextStyle(fontSize: 12, color: Colors.white54, fontWeight: FontWeight.w600)),
                const Icon(Icons.water_drop_outlined, size: 16, color: Color(0xFF06B6D4)),
              ],
            ),
            Text('$waterIntake / $target ml', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: pct,
                color: pct >= 1.0 ? const Color(0xFF10B981) : const Color(0xFF06B6D4),
                backgroundColor: Colors.white10,
                minHeight: 5,
              ),
            ),
            Row(
              children: [
                _buildWaterQuickBtn(state, '+250ml', 250),
                const SizedBox(width: 4),
                _buildWaterQuickBtn(state, '+500ml', 500),
                const SizedBox(width: 4),
                Expanded(
                  child: InkWell(
                    onTap: () => _showCustomWaterDialog(state),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF06B6D4).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text('+ Custom', style: TextStyle(fontSize: 9, color: Color(0xFF06B6D4), fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWaterQuickBtn(AppState state, String label, int ml) {
    return InkWell(
      onTap: () {
        state.addLog('nutrition', {
          'foodItem': 'Water (${ml}ml)',
          'volume': ml,
          'calories': 0,
          'timestamp': DateTime.now().toIso8601String(),
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFF10B981).withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(label, style: const TextStyle(fontSize: 9, color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
      ),
    );
  }

  void _showCustomWaterDialog(AppState state) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161C36),
        title: const Text('Log Water Intake', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Type exact custom volume in ml:', style: TextStyle(fontSize: 12, color: Colors.white60)),
            const SizedBox(height: 8),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              autofocus: true,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                hintText: 'e.g. 22, 75, 350',
                suffixText: 'ml',
                filled: true,
                fillColor: const Color(0xFF0C0F20),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildGlassOption(controller, '+100ml', 100),
                _buildGlassOption(controller, '+250ml', 250),
                _buildGlassOption(controller, '+500ml', 500),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final ml = int.tryParse(controller.text.trim()) ?? 0;
              if (ml > 0) {
                state.addLog('nutrition', {
                  'foodItem': 'Water (${ml}ml)',
                  'volume': ml,
                  'calories': 0,
                  'timestamp': DateTime.now().toIso8601String(),
                });
                controller.clear();
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('✓ Logged ${ml}ml water!'),
                    backgroundColor: const Color(0xFF06B6D4),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF06B6D4), foregroundColor: Colors.white),
            child: const Text('Add / Log Hydration', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassOption(TextEditingController controller, String label, int ml) {
    return GestureDetector(
      onTap: () => controller.text = ml.toString(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFF0C0F20),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            const Text('🥤', style: TextStyle(fontSize: 16)),
            Text(label, style: const TextStyle(fontSize: 9, color: Colors.white54)),
          ],
        ),
      ),
    );
  }
}

// Circular paint rings
class FatigueCircularPainter extends CustomPainter {
  final int score;
  final Color color;

  FatigueCircularPainter(this.score, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Track
    final trackPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.05)
      ..strokeWidth = 8
      ..style = PaintingStyle.stroke;

    canvas.drawCircle(center, radius - 4, trackPaint);

    // Arc
    final arcPaint = Paint()
      ..color = color
      ..strokeWidth = 8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final double sweepAngle = 2 * pi * (score.clamp(0, 100) / 100.0);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius - 4),
      -pi / 2,
      sweepAngle,
      false,
      arcPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
