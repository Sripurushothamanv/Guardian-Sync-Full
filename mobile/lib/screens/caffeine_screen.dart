import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../widgets/voice_input_button.dart';

class CaffeineScreen extends StatefulWidget {
  const CaffeineScreen({super.key});

  @override
  State<CaffeineScreen> createState() => _CaffeineScreenState();
}

class _CaffeineScreenState extends State<CaffeineScreen> with SingleTickerProviderStateMixin {
  TabController? _tabController;
  
  // Manual States
  String _beverage = 'Filter Coffee';
  int _count = 1;
  DateTime _logDateTime = DateTime.now();
  
  // AI States
  final _aiController = TextEditingController();
  bool _parsing = false;
  Map<String, dynamic>? _parsedResult;

  final List<Map<String, dynamic>> _beverages = [
    {'name': 'Filter Coffee', 'mg': 95, 'icon': '☕'},
    {'name': 'Espresso', 'mg': 75, 'icon': '☕'},
    {'name': 'Energy Drink', 'mg': 80, 'icon': '🥤'},
    {'name': 'Tea', 'mg': 30, 'icon': '🍵'}
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  void _submitManual() async {
    final state = Provider.of<AppState>(context, listen: false);
    final bev = _beverages.firstWhere((b) => b['name'] == _beverage);
    final mg = (bev['mg'] as int) * _count;

    await state.addLog('caffeine', {
      'beverage': _beverage,
      'mgAmount': mg,
      'timestamp': _logDateTime.toIso8601String()
    });

    state.runOfflineCalculations();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Logged $mg mg caffeine! Active level: ${state.dashboardData['activeCaffeine']} mg'),
          backgroundColor: const Color(0xFF06B6D4),
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

    if (result != null && result['caffeine'] != null) {
      setState(() => _parsedResult = result);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to parse caffeine details.')),
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
        const SnackBar(content: Text('Caffeine logged via AI!'), backgroundColor: Color(0xFF06B6D4)),
      );
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    }
  }

  Future<void> _selectDateTime() async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: _logDateTime,
      firstDate: DateTime(2025),
      lastDate: DateTime.now(),
    );

    if (pickedDate != null && mounted) {
      final TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_logDateTime),
      );

      if (pickedTime != null) {
        setState(() {
          _logDateTime = DateTime(
            pickedDate.year, pickedDate.month, pickedDate.day,
            pickedTime.hour, pickedTime.minute,
          );
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final activeCaffeine = state.dashboardData['activeCaffeine'] ?? 0;
    final isOverlimit = activeCaffeine > 400;

    final bool isEmbedded = !Navigator.of(context).canPop();

    return Scaffold(
      appBar: isEmbedded
          ? PreferredSize(
              preferredSize: const Size.fromHeight(kToolbarHeight),
              child: Container(
                color: const Color(0xFF0C0F20),
                child: TabBar(
                  controller: _tabController,
                  indicatorColor: const Color(0xFF06B6D4),
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
              title: const Text('Caffeine Tracker'),
              backgroundColor: const Color(0xFF0C0F20),
              bottom: TabBar(
                controller: _tabController,
                indicatorColor: const Color(0xFF06B6D4),
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
                if (isOverlimit)
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
                        Expanded(child: Text('Active caffeine is high. Dehydration hazard.', style: TextStyle(fontSize: 12, color: Colors.redAccent))),
                      ],
                    ),
                  ),
                const Text('Select Beverage Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 8),
                GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: 2.2,
                  children: _beverages.map((bev) {
                    final isSel = _beverage == bev['name'];
                    return GestureDetector(
                      onTap: () => setState(() => _beverage = bev['name']),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isSel ? const Color(0xFF06B6D4).withValues(alpha: 0.15) : const Color(0xFF161C36),
                          border: Border.all(color: isSel ? const Color(0xFF06B6D4) : Colors.white.withValues(alpha: 0.04)),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            Text(bev['icon'], style: const TextStyle(fontSize: 22)),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(bev['name'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                Text('~${bev['mg']}mg', style: const TextStyle(fontSize: 10, color: Colors.white54)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                // Servings Stepper Card
                const Text(
                  'Number of Servings',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 8),
                Card(
                  color: const Color(0xFF161C36),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.white.withValues(alpha: 0.06)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Serving Size',
                              style: TextStyle(fontSize: 11, color: Colors.white54, fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '$_count ${_count == 1 ? "cup" : "cups"} (${_count * ((_beverages.firstWhere((b) => b['name'] == _beverage, orElse: () => _beverages.first)['mg'] as num).toInt())} mg)',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Material(
                              color: Colors.transparent,
                              child: InkWell(
                                onTap: () => setState(() => _count = _count > 1 ? _count - 1 : 1),
                                borderRadius: BorderRadius.circular(22),
                                child: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0C0F20),
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: const Color(0xFF06B6D4).withValues(alpha: 0.3),
                                    ),
                                  ),
                                  child: const Icon(Icons.remove, color: Color(0xFF06B6D4), size: 18),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 14),
                              child: Text(
                                '$_count',
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: Colors.white),
                              ),
                            ),
                            Material(
                              color: Colors.transparent,
                              child: InkWell(
                                onTap: () => setState(() => _count++),
                                borderRadius: BorderRadius.circular(22),
                                child: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF06B6D4),
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF06B6D4).withValues(alpha: 0.3),
                                        blurRadius: 6,
                                        spreadRadius: 1,
                                      ),
                                    ],
                                  ),
                                  child: const Icon(Icons.add, color: Colors.white, size: 18),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Date & Time Picker Card
                const Text(
                  'Date & Time Logged',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 8),
                Card(
                  color: const Color(0xFF161C36),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.white.withValues(alpha: 0.06)),
                  ),
                  child: InkWell(
                    onTap: _selectDateTime,
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF06B6D4).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.access_time_rounded, size: 20, color: Color(0xFF06B6D4)),
                          ),
                          const SizedBox(width: 14),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Log Timestamp',
                                style: TextStyle(fontSize: 11, color: Colors.white54, fontWeight: FontWeight.w500),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_logDateTime.day.toString().padLeft(2, '0')}/${_logDateTime.month.toString().padLeft(2, '0')}/${_logDateTime.year}  at  ${_logDateTime.hour.toString().padLeft(2, '0')}:${_logDateTime.minute.toString().padLeft(2, '0')}',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ],
                          ),
                          const Spacer(),
                          const Icon(Icons.edit_calendar_rounded, size: 18, color: Colors.white38),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _submitManual,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF06B6D4),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Log Caffeine', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
                const Text('AI Intake Parsing', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _aiController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText: 'e.g. I had 2 espressos at noon today.',
                          filled: true,
                          fillColor: const Color(0xFF161C36),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    VoiceInputButton(
                      controller: _aiController,
                      accentColor: const Color(0xFF06B6D4),
                      onTranscriptionComplete: _parseAI,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _parsing ? null : _parseAI,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF06B6D4),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: _parsing 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 1.5))
                    : const Icon(Icons.auto_awesome, size: 16),
                  label: const Text('Parse Intake with AI'),
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
                              const Text('Beverage:'),
                              Text('${_parsedResult!['caffeine']['beverage']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Servings:'),
                              Text('${_parsedResult!['caffeine']['count']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Caffeine:'),
                              Text('${_parsedResult!['caffeine']['mgAmount']} mg', style: const TextStyle(fontWeight: FontWeight.bold)),
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
