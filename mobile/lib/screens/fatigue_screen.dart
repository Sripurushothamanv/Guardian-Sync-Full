import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class FatigueScreen extends StatefulWidget {
  const FatigueScreen({super.key});

  @override
  State<FatigueScreen> createState() => _FatigueScreenState();
}

class _FatigueScreenState extends State<FatigueScreen> {
  // Simulator States
  double _simSleepDebt = 2.0;
  double _simAwakeHours = 8.0;
  String _simShiftType = 'Night';
  double _simCaffeine = 150.0;

  Future<void> _syncSimulationWithDashboard(AppState state) async {
    await state.applyFatigueSimulation(
      sleepDebt: _simSleepDebt,
      awakeHours: _simAwakeHours,
      activeCaffeine: _simCaffeine.round(),
      shiftType: _simShiftType,
    );
  }

  Color _getFatigueColor(int score) {
    if (score >= 80) return const Color(0xFFEF4444);
    if (score >= 60) return const Color(0xFFF59E0B);
    if (score >= 40) return const Color(0xFFFBBF24);
    return const Color(0xFF10B981);
  }

  int _calculateSimulatedScore() {
    int si = 0;
    if (_simShiftType == 'Night') {
      si = 30;
    } else if (_simShiftType == 'On-Call') si = 25;
    else if (_simShiftType == 'Rotating') si = 20;
    else if (_simShiftType == 'Day') si = 10;

    final ca = _simCaffeine * 0.15;
    final score = (_simSleepDebt * 3) + (_simAwakeHours * 1.5) + si - ca;
    return score.clamp(0, 100).round();
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final data = state.dashboardData;

    final double sleepDebt = (data['sleepDebt'] ?? 0.0).toDouble();
    final int activeCaffeine = data['activeCaffeine'] ?? 0;
    final double awakeHours = (data['awakeHours'] ?? 0.0).toDouble();
    
    // Weight calculations
    final double sdWeight = sleepDebt * 3;
    final double ahWeight = awakeHours * 1.5;
    int siWeight = 0;
    if (data['activeShift'] != null) {
      final type = data['activeShift']['type'];
      if (type == 'Night') {
        siWeight = 30;
      } else if (type == 'On-Call') siWeight = 25;
      else if (type == 'Rotating') siWeight = 20;
      else siWeight = 10;
    }
    final double caDeduction = activeCaffeine * 0.15;

    final int simScore = _calculateSimulatedScore();
    final Color simColor = _getFatigueColor(simScore);

    return Scaffold(
      appBar: AppBar(title: const Text('Fatigue Analytics'), backgroundColor: const Color(0xFF0C0F20)),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
            // Current Breakdown
            const Text('Heuristic Parameter Weights', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            Card(
              color: const Color(0xFF161C36),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildFactorRow('Sleep Debt (x3)', '+${sdWeight.toStringAsFixed(1)} pts', sdWeight, 45.0, const Color(0xFF8B5CF6)),
                    const SizedBox(height: 12),
                    _buildFactorRow('Hours Awake (x1.5)', '+${ahWeight.toStringAsFixed(1)} pts', ahWeight, 36.0, const Color(0xFFFBBF24)),
                    const SizedBox(height: 12),
                    _buildFactorRow('Active Shift Load', '+$siWeight pts', siWeight.toDouble(), 30.0, const Color(0xFFF59E0B)),
                    const SizedBox(height: 12),
                    _buildFactorRow('Caffeine Alertness (x0.15)', '-${caDeduction.toStringAsFixed(1)} pts', caDeduction, 90.0, const Color(0xFF06B6D4)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Simulator
            Row(
              children: [
                const Icon(Icons.tune, color: Color(0xFF06B6D4), size: 18),
                const SizedBox(width: 8),
                const Text('Fatigue Planning Simulator', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              ],
            ),
            const SizedBox(height: 12),
            Card(
              color: const Color(0xFF161C36),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Resulting score
                    Center(
                      child: Column(
                        children: [
                          Text(
                            '$simScore',
                            style: TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: simColor),
                          ),
                          Text(
                            'Simulated Risk',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: simColor, letterSpacing: 0.5),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Sliders
                    _buildSimSlider(
                      'Simulated Sleep Debt',
                      _simSleepDebt,
                      0.0,
                      15.0,
                      30,
                      (val) => setState(() => _simSleepDebt = val),
                      '${_simSleepDebt.toStringAsFixed(1)} hrs',
                      Icons.bedtime_rounded,
                      const Color(0xFF8B5CF6),
                    ),
                    _buildSimSlider(
                      'Simulated Hours Awake',
                      _simAwakeHours,
                      1.0,
                      24.0,
                      46,
                      (val) => setState(() => _simAwakeHours = val),
                      '${_simAwakeHours.toStringAsFixed(1)} hrs',
                      Icons.wb_sunny_rounded,
                      const Color(0xFFFBBF24),
                    ),
                    _buildSimSlider(
                      'Simulated Active Caffeine',
                      _simCaffeine,
                      0.0,
                      600.0,
                      24,
                      (val) => setState(() => _simCaffeine = val),
                      '${_simCaffeine.round()} mg',
                      Icons.local_cafe_rounded,
                      const Color(0xFF06B6D4),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Simulated Shift Duty:',
                      style: TextStyle(fontSize: 12, color: Colors.white70, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0C0F20),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _simShiftType,
                          isExpanded: true,
                          dropdownColor: const Color(0xFF0C0F20),
                          items: const [
                            DropdownMenuItem(value: 'None', child: Text('No Active Shift')),
                            DropdownMenuItem(value: 'Day', child: Text('☀️ Day Shift (+10 pts)')),
                            DropdownMenuItem(value: 'Rotating', child: Text('🔄 Rotating Shift (+20 pts)')),
                            DropdownMenuItem(value: 'On-Call', child: Text('🩺 On-Call Duty (+25 pts)')),
                            DropdownMenuItem(value: 'Night', child: Text('🌙 Night Shift (+30 pts)')),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              setState(() => _simShiftType = val);
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () async {
                        await _syncSimulationWithDashboard(state);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('✓ Fatigue simulation applied! Score: $simScore'),
                              backgroundColor: const Color(0xFF06B6D4),
                            ),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF06B6D4),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.bolt, size: 20),
                      label: const Text(
                        'Save / Apply Simulation',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                  ],
                ),
              ),
            ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        color: const Color(0xFF0C0F20),
        child: ElevatedButton(
          onPressed: () async {
            await _syncSimulationWithDashboard(state);
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('✓ Fatigue simulation applied! Score: $simScore'),
                  backgroundColor: const Color(0xFF06B6D4),
                ),
              );
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF06B6D4),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: const Text('SAVE & APPLY TO DASHBOARD', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        ),
      ),
    );
  }

  Widget _buildFactorRow(String label, String value, double current, double maxVal, Color color) {
    final pct = (current / max(1.0, maxVal)).clamp(0.0, 1.0);
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, color: Colors.white70)),
            Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 4),
        LinearProgressIndicator(
          value: pct,
          color: color,
          backgroundColor: Colors.white10,
          minHeight: 6,
          borderRadius: BorderRadius.circular(3),
        ),
      ],
    );
  }

  Widget _buildSimSlider(
    String label,
    double value,
    double minVal,
    double maxVal,
    int divisions,
    ValueChanged<double> onChanged,
    String valueDisplay,
    IconData icon,
    Color accentColor,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0C0F20),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, size: 16, color: accentColor),
                  const SizedBox(width: 8),
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Colors.white70,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  valueDisplay,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: accentColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Slider(
            min: minVal,
            max: maxVal,
            divisions: divisions,
            value: value.clamp(minVal, maxVal),
            activeColor: accentColor,
            inactiveColor: Colors.white10,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}
