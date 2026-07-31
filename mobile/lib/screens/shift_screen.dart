import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../widgets/voice_input_button.dart';

class ShiftScreen extends StatefulWidget {
  const ShiftScreen({super.key});

  @override
  State<ShiftScreen> createState() => _ShiftScreenState();
}

class _ShiftScreenState extends State<ShiftScreen> with SingleTickerProviderStateMixin {
  TabController? _tabController;
  
  // Manual States
  String _shiftType = 'Day';
  int _breakDuration = 30;
  DateTime _startTime = DateTime.now();
  DateTime _endTime = DateTime.now().add(const Duration(hours: 8));
  final _notesController = TextEditingController();
  
  // AI States
  final _aiController = TextEditingController();
  bool _parsing = false;
  Map<String, dynamic>? _parsedResult;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  int get _shiftImpactFatigue {
    if (_shiftType == 'Night') return 30;
    if (_shiftType == 'On-Call') return 25;
    if (_shiftType == 'Rotating') return 20;
    return 10;
  }

  void _submitManual() async {
    final state = Provider.of<AppState>(context, listen: false);

    await state.addLog('shift', {
      'shiftType': _shiftType,
      'breakDuration': _breakDuration,
      'startTime': _startTime.toIso8601String(),
      'endTime': _endTime.toIso8601String(),
      'notes': _notesController.text.trim()
    });

    state.runOfflineCalculations();

    _notesController.clear();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Logged $_shiftType Shift (+$_shiftImpactFatigue Fatigue Impact)!'),
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

    if (result != null && result['shift'] != null) {
      setState(() => _parsedResult = result);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to parse shift logs.')),
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
        const SnackBar(content: Text('Shift logged via AI!'), backgroundColor: Color(0xFF10B981)),
      );
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    }
  }

  Future<void> _selectDateTime(BuildContext context, bool isStart) async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: isStart ? _startTime : _endTime,
      firstDate: DateTime(2025),
      lastDate: DateTime(2030),
    );

    if (pickedDate != null && mounted) {
      final TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(isStart ? _startTime : _endTime),
      );

      if (pickedTime != null) {
        setState(() {
          final dt = DateTime(pickedDate.year, pickedDate.month, pickedDate.day, pickedTime.hour, pickedTime.minute);
          if (isStart) {
            _startTime = dt;
          } else {
            _endTime = dt;
          }
        });
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
                  indicatorColor: const Color(0xFFF59E0B),
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
              title: const Text('Log Shift Roster'),
              backgroundColor: const Color(0xFF0C0F20),
              bottom: TabBar(
                controller: _tabController,
                indicatorColor: const Color(0xFFF59E0B),
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
          // Manual Entry
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Active Fatigue Impact Card
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF161C36),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.bolt, color: Color(0xFFF59E0B), size: 22),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Selected: $_shiftType Duty Shift',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '+$_shiftImpactFatigue Fatigue Impact Points',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF161C36),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _shiftType,
                            isExpanded: true,
                            dropdownColor: const Color(0xFF0C0F20),
                            items: const [
                              DropdownMenuItem(value: 'Day', child: Text('☀️ Day Shift (+10 pts)')),
                              DropdownMenuItem(value: 'Rotating', child: Text('🔄 Rotating Shift (+20 pts)')),
                              DropdownMenuItem(value: 'On-Call', child: Text('🩺 On-Call Duty (+25 pts)')),
                              DropdownMenuItem(value: 'Night', child: Text('🌙 Night Shift (+30 pts)')),
                            ],
                            onChanged: (val) {
                              if (val != null) setState(() => _shiftType = val);
                            },
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF161C36),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<int>(
                            value: _breakDuration,
                            isExpanded: true,
                            dropdownColor: const Color(0xFF0C0F20),
                            items: const [
                              DropdownMenuItem(value: 0, child: Text('No Breaks')),
                              DropdownMenuItem(value: 15, child: Text('15 Minutes')),
                              DropdownMenuItem(value: 30, child: Text('30 Minutes')),
                              DropdownMenuItem(value: 45, child: Text('45 Minutes')),
                              DropdownMenuItem(value: 60, child: Text('60 Minutes')),
                            ],
                            onChanged: (val) {
                              if (val != null) setState(() => _breakDuration = val);
                            },
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                ListTile(
                  leading: const Icon(Icons.calendar_today, color: Color(0xFFF59E0B)),
                  title: const Text('Start Time'),
                  subtitle: Text(_startTime.toString().substring(0, 16)),
                  trailing: const Icon(Icons.arrow_drop_down),
                  onTap: () => _selectDateTime(context, true),
                  tileColor: const Color(0xFF161C36),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                const SizedBox(height: 12),
                ListTile(
                  leading: const Icon(Icons.calendar_today, color: Color(0xFFF59E0B)),
                  title: const Text('End Time'),
                  subtitle: Text(_endTime.toString().substring(0, 16)),
                  trailing: const Icon(Icons.arrow_drop_down),
                  onTap: () => _selectDateTime(context, false),
                  tileColor: const Color(0xFF161C36),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _notesController,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.notes, color: Colors.white38),
                    labelText: 'Notes',
                    filled: true,
                    fillColor: const Color(0xFF161C36),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _submitManual,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF59E0B),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Log Shift', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),

          // AI Log
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('AI Shift Parser', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _aiController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText: 'e.g. Worked a 12 hour night shift yesterday with 45 minutes breaks.',
                          filled: true,
                          fillColor: const Color(0xFF161C36),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    VoiceInputButton(
                      controller: _aiController,
                      accentColor: const Color(0xFFF59E0B),
                      onTranscriptionComplete: _parseAI,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _parsing ? null : _parseAI,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF59E0B),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: _parsing 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 1.5))
                    : const Icon(Icons.auto_awesome, size: 16),
                  label: const Text('Parse Shift with AI'),
                ),
                if (_parsedResult != null) ...[
                  const SizedBox(height: 24),
                  Card(
                    color: const Color(0xFF0C0F20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('🤖 AI Extracted Shift Details:', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFF59E0B))),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Shift Type:'),
                              Text('${_parsedResult!['shift']['shiftType']} Shift', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Duration:'),
                              Text('${_parsedResult!['shift']['duration']} hours', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Break duration:'),
                              Text('${_parsedResult!['shift']['breakDuration']} mins', style: const TextStyle(fontWeight: FontWeight.bold)),
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
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B), foregroundColor: Colors.white),
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
