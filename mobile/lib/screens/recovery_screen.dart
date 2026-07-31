import 'dart:async';
import 'package:flutter/material.dart';

class RecoveryScreen extends StatefulWidget {
  const RecoveryScreen({super.key});

  @override
  State<RecoveryScreen> createState() => _RecoveryScreenState();
}

class _RecoveryScreenState extends State<RecoveryScreen> {
  int _secondsLeft = 15 * 60; // 15 mins
  bool _timerActive = false;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _toggleTimer() {
    if (_timerActive) {
      _timer?.cancel();
      setState(() => _timerActive = false);
    } else {
      setState(() => _timerActive = true);
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (_secondsLeft > 0) {
          setState(() => _secondsLeft--);
        } else {
          _timer?.cancel();
          setState(() {
            _timerActive = false;
            _secondsLeft = 15 * 60;
          });
          _showNapCompleteAlert();
        }
      });
    }
  }

  void _resetTimer() {
    _timer?.cancel();
    setState(() {
      _timerActive = false;
      _secondsLeft = 15 * 60;
    });
  }

  void _showNapCompleteAlert() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nap Complete! 😴'),
        content: const Text('Your 15-minute power nap is finished. We advise performing our alertness reaction test before starting your vehicle.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
        ],
      ),
    );
  }

  String _formatTime(int secs) {
    final mins = secs ~/ 60;
    final rem = secs % 60;
    return '$mins:${rem < 10 ? '0' : ''}$rem';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Recovery Center'), backgroundColor: const Color(0xFF0C0F20)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Nap Card Timer widget
            Card(
              color: const Color(0xFF161C36),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                child: Column(
                  children: [
                    const Text(
                      'Guided Sleep Anchor Nap',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const Text(
                      'Pink noise generator active in background',
                      style: TextStyle(color: Colors.white38, fontSize: 11),
                    ),
                    const SizedBox(height: 24),
                    
                    // Circular visual timer
                    Container(
                      width: 140,
                      height: 140,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF070913),
                        border: Border.all(
                          color: _timerActive ? const Color(0xFF06B6D4) : const Color(0xFF8B5CF6),
                          width: 4
                        ),
                        boxShadow: _timerActive ? [
                          BoxShadow(color: const Color(0xFF06B6D4).withValues(alpha: 0.15), blurRadius: 15)
                        ] : [],
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        _formatTime(_secondsLeft),
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TextButton.icon(
                          onPressed: _resetTimer,
                          icon: const Icon(Icons.refresh, size: 16, color: Colors.white60),
                          label: const Text('Reset', style: TextStyle(color: Colors.white60)),
                        ),
                        const SizedBox(width: 20),
                        ElevatedButton.icon(
                          onPressed: _toggleTimer,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _timerActive ? const Color(0xFFEF4444) : const Color(0xFF8B5CF6),
                            foregroundColor: Colors.white,
                          ),
                          icon: Icon(_timerActive ? Icons.pause : Icons.play_arrow),
                          label: Text(_timerActive ? 'Pause' : 'Start Nap'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            const Text('Personalized Recovery Feeds', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            _buildRecCard('Melatonin Phase Curfew', 'Wear dark sunglasses if driving home after morning night duties to prevent bright solar exposure from blocking melatonin.', const Color(0xFF06B6D4)),
            _buildRecCard('Vagal Deep Breathing', 'Perform 4s inhale, 4s hold, 6s exhale breathing cycles to trigger parasympathetic vagus alignment.', const Color(0xFF8B5CF6)),
          ],
        ),
      ),
    );
  }

  Widget _buildRecCard(String title, String desc, Color color) {
    return Card(
      color: const Color(0xFF161C36),
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(radius: 4, backgroundColor: color),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 6),
            Text(desc, style: const TextStyle(fontSize: 11, color: Colors.white70, height: 1.4)),
          ],
        ),
      ),
    );
  }
}
