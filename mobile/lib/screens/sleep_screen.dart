import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../widgets/voice_input_button.dart';

class SleepScreen extends StatefulWidget {
  const SleepScreen({super.key});

  @override
  State<SleepScreen> createState() => _SleepScreenState();
}

class _SleepScreenState extends State<SleepScreen> with SingleTickerProviderStateMixin {
  TabController? _tabController;
  
  // Manual States
  double _hours = 7.5;
  double _awakeHours = 6.0;
  String _quality = 'Good';
  int _wakeUps = 0;
  TimeOfDay _bedTime = const TimeOfDay(hour: 23, minute: 0); // 11:00 PM
  TimeOfDay _wakeTime = const TimeOfDay(hour: 6, minute: 30); // 06:30 AM

  // AI States
  final _aiController = TextEditingController();
  bool _parsing = false;
  Map<String, dynamic>? _parsedResult;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  String _formatTimeOfDay(TimeOfDay tod) {
    final hour = tod.hourOfPeriod == 0 ? 12 : tod.hourOfPeriod;
    final minute = tod.minute.toString().padLeft(2, '0');
    final period = tod.period == DayPeriod.am ? 'AM' : 'PM';
    return '${hour.toString().padLeft(2, '0')}:$minute $period';
  }

  String _formatDurationString(double hours) {
    final int h = hours.floor();
    final int m = ((hours - h) * 60).round();
    if (m == 0) return '${h}h 00m (${hours.toStringAsFixed(1)} hrs)';
    return '${h}h ${m}m (${hours.toStringAsFixed(1)} hrs)';
  }

  void _selectBedTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _bedTime,
    );
    if (picked != null) {
      setState(() {
        _bedTime = picked;
        _recalculateDurationFromTimes();
      });
    }
  }

  void _selectWakeTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _wakeTime,
    );
    if (picked != null) {
      setState(() {
        _wakeTime = picked;
        _recalculateDurationFromTimes();
      });
    }
  }

  void _recalculateDurationFromTimes() {
    final now = DateTime.now();
    var start = DateTime(now.year, now.month, now.day, _bedTime.hour, _bedTime.minute);
    var end = DateTime(now.year, now.month, now.day, _wakeTime.hour, _wakeTime.minute);
    if (end.isBefore(start)) {
      end = end.add(const Duration(days: 1));
    }
    final diffMinutes = end.difference(start).inMinutes;
    if (diffMinutes > 0) {
      final calculatedHours = (diffMinutes / 60.0).clamp(1.0, 14.0);
      _hours = calculatedHours;
    }
  }

  void _submitManual() async {
    final state = Provider.of<AppState>(context, listen: false);
    final now = DateTime.now();
    final start = DateTime(now.year, now.month, now.day, _bedTime.hour, _bedTime.minute);
    final end = DateTime(now.year, now.month, now.day, _wakeTime.hour, _wakeTime.minute);

    await state.addLog('sleep', {
      'startTime': start.toIso8601String(),
      'endTime': end.toIso8601String(),
      'bedTimeFormatted': _formatTimeOfDay(_bedTime),
      'wakeTimeFormatted': _formatTimeOfDay(_wakeTime),
      'duration': _hours,
      'durationFormatted': _formatDurationString(_hours),
      'quality': _quality,
      'wakeUps': _wakeUps,
      'awakeHours': _awakeHours,
    });
    await state.setAwakeHours(_awakeHours);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Logged ${_formatDurationString(_hours)} session (${_formatTimeOfDay(_bedTime)} to ${_formatTimeOfDay(_wakeTime)})!'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    }
  }

  void _parseAI() async {
    if (_aiController.text.isEmpty) return;
    setState(() {
      _parsing = true;
      _parsedResult = null;
    });

    final state = Provider.of<AppState>(context, listen: false);
    final result = await state.addAILog(_aiController.text);
    
    setState(() => _parsing = false);

    if (result != null && result['sleep'] != null) {
      setState(() => _parsedResult = result);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to parse sleep details. Specify sleep hours.')),
        );
      }
    }
  }

  void _confirmAI() async {
    if (_parsedResult == null) return;
    final state = Provider.of<AppState>(context, listen: false);
    
    setState(() => _parsing = true);
    await state.confirmAILog(_parsedResult!);
    setState(() => _parsing = false);
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sleep logged via AI!'), backgroundColor: Color(0xFF10B981)),
      );
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isEmbedded = !Navigator.of(context).canPop();

    return Scaffold(
      appBar: isEmbedded
          ? PreferredSize(
              preferredSize: const Size.fromHeight(kToolbarHeight),
              child: Container(
                color: const Color(0xFF0C0F20),
                child: TabBar(
                  controller: _tabController,
                  indicatorColor: const Color(0xFF8B5CF6),
                  labelColor: Colors.white,
                  unselectedLabelColor: Colors.white54,
                  indicatorWeight: 3,
                  labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 13),
                  tabs: const [
                    Tab(text: '✍️ Manual Log'),
                    Tab(text: '🤖 AI Parser'),
                  ],
                ),
              ),
            )
          : AppBar(
              title: const Text('Sleep & Recovery Logs'),
              backgroundColor: const Color(0xFF0C0F20),
              bottom: TabBar(
                controller: _tabController,
                indicatorColor: const Color(0xFF8B5CF6),
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white54,
                indicatorWeight: 3,
                labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 13),
                tabs: const [
                  Tab(text: '✍️ Manual Log'),
                  Tab(text: '🤖 AI Parser'),
                ],
              ),
            ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Manual Log Form
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Bedtime & Wake-Up Time 12-Hour Pickers Card
                const Text('Log Bedtime & Wake-Up Schedule', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: _selectBedTime,
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF161C36),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.bedtime_outlined, size: 14, color: Color(0xFF8B5CF6)),
                                  SizedBox(width: 6),
                                  Text('Bedtime', style: TextStyle(fontSize: 12, color: Colors.white54)),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                _formatTimeOfDay(_bedTime),
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: _selectWakeTime,
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF161C36),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.wb_sunny_outlined, size: 14, color: Color(0xFFFBBF24)),
                                  SizedBox(width: 6),
                                  Text('Wake-Up Time', style: TextStyle(fontSize: 12, color: Colors.white54)),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                _formatTimeOfDay(_wakeTime),
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('Log Sleep Duration', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 8),
                Card(
                  color: const Color(0xFF161C36),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Duration', style: TextStyle(color: Colors.white70)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                _formatDurationString(_hours),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF8B5CF6)),
                              ),
                            ),
                          ],
                        ),
                        Slider(
                          min: 1.0,
                          max: 14.0,
                          divisions: 26,
                          value: _hours,
                          activeColor: const Color(0xFF8B5CF6),
                          onChanged: (val) => setState(() => _hours = val),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Hours Awake / Wake-Up Baseline', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 8),
                Card(
                  color: const Color(0xFF161C36),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Continuous Awake Duration', style: TextStyle(color: Colors.white70)),
                            Text('${_awakeHours.toStringAsFixed(1)} hrs', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF38BDF8))),
                          ],
                        ),
                        Slider(
                          min: 1.0,
                          max: 24.0,
                          divisions: 46,
                          value: _awakeHours,
                          activeColor: const Color(0xFF38BDF8),
                          onChanged: (val) => setState(() => _awakeHours = val),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Sleep Quality', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 8),
                Row(
                  children: ['Poor', 'Fair', 'Good', 'Excellent'].map((q) {
                    final isSel = _quality == q;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _quality = q),
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: isSel ? const Color(0xFF8B5CF6).withValues(alpha: 0.15) : const Color(0xFF161C36),
                            border: Border.all(color: isSel ? const Color(0xFF8B5CF6) : Colors.white.withValues(alpha: 0.04)),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(q, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isSel ? Colors.white : Colors.white60), textAlign: TextAlign.center),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),
                const Text('Interruptions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 8),
                Card(
                  color: const Color(0xFF161C36),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Wake ups', style: TextStyle(color: Colors.white70)),
                        Row(
                          children: [
                            IconButton(onPressed: () => setState(() => _wakeUps = _wakeUps > 0 ? _wakeUps - 1 : 0), icon: const Icon(Icons.remove)),
                            Text('$_wakeUps', style: const TextStyle(fontWeight: FontWeight.bold)),
                            IconButton(onPressed: () => setState(() => _wakeUps++), icon: const Icon(Icons.add)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _submitManual,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B5CF6),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Log Session', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ],
            ),
          ),

          // AI Log Form
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Voice/Chat AI Log', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _aiController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText: 'e.g. I slept 6.5 hours yesterday, woke up twice and felt restless.',
                          filled: true,
                          fillColor: const Color(0xFF161C36),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    VoiceInputButton(
                      controller: _aiController,
                      accentColor: const Color(0xFF8B5CF6),
                      onTranscriptionComplete: _parseAI,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _parsing ? null : _parseAI,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B5CF6),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: _parsing 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 1.5))
                    : const Icon(Icons.auto_awesome, size: 16),
                  label: const Text('Parse with AI'),
                ),
                if (_parsedResult != null) ...[
                  const SizedBox(height: 24),
                  Card(
                    color: const Color(0xFF0C0F20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: const Color(0xFF06B6D4).withValues(alpha: 0.3)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('🤖 AI Extracted Details:', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF06B6D4))),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Duration:'),
                              Text('${_parsedResult!['sleep']['duration']} hours', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Quality:'),
                              Text('${_parsedResult!['sleep']['quality']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Interruptions:'),
                              Text('${_parsedResult!['sleep']['wakeUps']} wake-ups', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton(onPressed: () => setState(() => _parsedResult = null), child: const Text('Cancel')),
                              const SizedBox(width: 12),
                              ElevatedButton(
                                onPressed: _confirmAI,
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF06B6D4), foregroundColor: Colors.white),
                                child: const Text('Confirm & Save'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
