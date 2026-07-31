import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../widgets/voice_input_button.dart';

class NutritionScreen extends StatefulWidget {
  const NutritionScreen({super.key});

  @override
  State<NutritionScreen> createState() => _NutritionScreenState();
}

class _NutritionScreenState extends State<NutritionScreen>
    with SingleTickerProviderStateMixin {
  TabController? _tabController;

  // Dish Macro Knowledge Base for realistic Indian & daily dishes
  static const Map<String, Map<String, int>> _dishDatabase = {
    'plain dosa': {'calories': 120, 'protein': 3, 'carbs': 22, 'fats': 4},
    'dosa': {'calories': 120, 'protein': 3, 'carbs': 22, 'fats': 4},
    'masala dosa': {'calories': 250, 'protein': 5, 'carbs': 40, 'fats': 8},
    'idli': {'calories': 60, 'protein': 2, 'carbs': 12, 'fats': 1},
    'sambar rice': {'calories': 250, 'protein': 6, 'carbs': 45, 'fats': 5},
    'sambar': {'calories': 130, 'protein': 4, 'carbs': 20, 'fats': 3},
    'curd rice': {'calories': 200, 'protein': 5, 'carbs': 30, 'fats': 6},
    'chapati': {'calories': 100, 'protein': 3, 'carbs': 18, 'fats': 3},
    'roti': {'calories': 100, 'protein': 3, 'carbs': 18, 'fats': 3},
    'poori': {'calories': 150, 'protein': 3, 'carbs': 20, 'fats': 7},
    'upma': {'calories': 180, 'protein': 4, 'carbs': 30, 'fats': 5},
    'pongal': {'calories': 220, 'protein': 5, 'carbs': 35, 'fats': 7},
    'biryani': {'calories': 450, 'protein': 18, 'carbs': 55, 'fats': 16},
    'chicken curry': {'calories': 240, 'protein': 22, 'carbs': 8, 'fats': 12},
    'paneer': {'calories': 280, 'protein': 14, 'carbs': 10, 'fats': 20},
    'egg': {'calories': 75, 'protein': 6, 'carbs': 1, 'fats': 5},
    'tea': {'calories': 40, 'protein': 1, 'carbs': 6, 'fats': 1},
    'coffee': {'calories': 50, 'protein': 1, 'carbs': 7, 'fats': 2},
  };

  // Manual States
  final _foodController = TextEditingController();
  final _waterInputController = TextEditingController();
  final _proteinController = TextEditingController(text: '3');
  final _carbsController = TextEditingController(text: '22');
  final _fatsController = TextEditingController(text: '4');

  String _category = 'Breakfast';
  int _calories = 120;
  int _protein = 3;
  int _carbs = 22;
  int _fats = 4;

  // AI States
  final _aiController = TextEditingController();
  bool _parsing = false;
  Map<String, dynamic>? _parsedResult;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _proteinController.dispose();
    _carbsController.dispose();
    _fatsController.dispose();
    super.dispose();
  }

  void _onFoodTextChanged(String text) {
    final norm = text.toLowerCase().trim();
    for (var entry in _dishDatabase.entries) {
      if (norm.contains(entry.key)) {
        final data = entry.value;
        setState(() {
          _calories = data['calories']!;
          _protein = data['protein']!;
          _carbs = data['carbs']!;
          _fats = data['fats']!;
          _proteinController.text = '$_protein';
          _carbsController.text = '$_carbs';
          _fatsController.text = '$_fats';
        });
        return;
      }
    }
  }

  void _submitWater() async {
    final ml = int.tryParse(_waterInputController.text.trim()) ?? 0;
    if (ml <= 0) return;
    final state = Provider.of<AppState>(context, listen: false);
    await state.addLog('nutrition', {
      'foodItem': 'Water (${ml}ml)',
      'volume': ml,
      'calories': 0,
      'timestamp': DateTime.now().toIso8601String(),
    });
    _waterInputController.clear();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Logged ${ml}ml water!'),
          backgroundColor: const Color(0xFF06B6D4),
        ),
      );
    }
  }

  void _submitManual() async {
    final foodDesc = _foodController.text.trim();
    if (foodDesc.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please enter a Food Item Description.'),
            backgroundColor: Colors.amber,
          ),
        );
      }
      return;
    }

    final int prot = int.tryParse(_proteinController.text.trim()) ?? _protein;
    final int carbs = int.tryParse(_carbsController.text.trim()) ?? _carbs;
    final int fats = int.tryParse(_fatsController.text.trim()) ?? _fats;

    final state = Provider.of<AppState>(context, listen: false);

    await state.addLog('nutrition', {
      'mealCategory': _category,
      'foodItem': foodDesc,
      'description': foodDesc,
      'calories': _calories,
      'protein': prot,
      'carbs': carbs,
      'fats': fats,
      'timestamp': DateTime.now().toIso8601String(),
    });

    _foodController.clear();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Logged "$foodDesc" ($_calories kcal, P:${prot}g C:${carbs}g F:${fats}g)!'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
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

    if (result != null &&
        result['nutrition'] != null &&
        (result['nutrition'] as List).isNotEmpty) {
      setState(() => _parsedResult = result);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to parse food details.')),
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
        const SnackBar(
          content: Text('Meal logged via AI!'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final today = DateTime.now();
    final todayMeals =
        state.logs['nutrition']?.where((n) {
          final logDate = DateTime.parse(n['timestamp'] ?? n['createdAt']);
          return logDate.year == today.year &&
              logDate.month == today.month &&
              logDate.day == today.day;
        }).toList() ??
        [];

    final totalCal = todayMeals.fold(
      0,
      (sum, m) => sum + (m['calories'] ?? 0) as int,
    );
    final totalProt = todayMeals.fold(
      0,
      (sum, m) => sum + (m['protein'] ?? 0) as int,
    );
    final totalCarbs = todayMeals.fold(
      0,
      (sum, m) => sum + (m['carbs'] ?? 0) as int,
    );
    final totalFats = todayMeals.fold(
      0,
      (sum, m) => sum + (m['fats'] ?? 0) as int,
    );

    final bool isEmbedded = !Navigator.of(context).canPop();

    return Scaffold(
      appBar: isEmbedded
          ? PreferredSize(
              preferredSize: const Size.fromHeight(kToolbarHeight),
              child: Container(
                color: const Color(0xFF0C0F20),
                child: TabBar(
                  controller: _tabController,
                  indicatorColor: const Color(0xFF10B981),
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
              title: const Text('Nutrition & Meal Logs'),
              backgroundColor: const Color(0xFF0C0F20),
              bottom: TabBar(
                controller: _tabController,
                indicatorColor: const Color(0xFF10B981),
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
                TextField(
                  controller: _foodController,
                  onChanged: _onFoodTextChanged,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(
                      Icons.restaurant_menu,
                      color: Colors.white38,
                    ),
                    labelText: 'Food Item Description (e.g. Plain Dosa, Sambar Rice)',
                    filled: true,
                    fillColor: const Color(0xFF161C36),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
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
                            value: _category,
                            isExpanded: true,
                            dropdownColor: const Color(0xFF0C0F20),
                            items: const [
                              DropdownMenuItem(
                                value: 'Breakfast',
                                child: Text('Breakfast'),
                              ),
                              DropdownMenuItem(
                                value: 'Lunch',
                                child: Text('Lunch'),
                              ),
                              DropdownMenuItem(
                                value: 'Dinner',
                                child: Text('Dinner'),
                              ),
                              DropdownMenuItem(
                                value: 'Snack',
                                child: Text('Snack'),
                              ),
                            ],
                            onChanged: (val) {
                              if (val != null) setState(() => _category = val);
                            },
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Calories'),
                    Text(
                      '$_calories kcal',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                    ),
                  ],
                ),
                Slider(
                  min: 30.0,
                  max: 1500.0,
                  divisions: 147,
                  value: _calories.toDouble().clamp(30.0, 1500.0),
                  activeColor: const Color(0xFF10B981),
                  onChanged: (val) => setState(() => _calories = val.round()),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _proteinController,
                        decoration: InputDecoration(
                          labelText: 'Protein (g)',
                          filled: true,
                          fillColor: const Color(0xFF161C36),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        keyboardType: TextInputType.number,
                        onChanged: (val) => _protein = int.tryParse(val) ?? 0,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _carbsController,
                        decoration: InputDecoration(
                          labelText: 'Carbs (g)',
                          filled: true,
                          fillColor: const Color(0xFF161C36),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        keyboardType: TextInputType.number,
                        onChanged: (val) => _carbs = int.tryParse(val) ?? 0,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _fatsController,
                        decoration: InputDecoration(
                          labelText: 'Fats (g)',
                          filled: true,
                          fillColor: const Color(0xFF161C36),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        keyboardType: TextInputType.number,
                        onChanged: (val) => _fats = int.tryParse(val) ?? 0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _submitManual,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Log Meal',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 24),

                // Hydration Log Card
                Card(
                  color: const Color(0xFF161C36),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('💧 Log Hydration Intake', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                            Text('${state.dashboardData['waterIntake'] ?? 0} / 3000 ml', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF06B6D4))),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _waterInputController,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  hintText: 'Enter exact ml (e.g. 22, 75, 350)',
                                  suffixText: 'ml',
                                  filled: true,
                                  fillColor: const Color(0xFF0C0F20),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            ElevatedButton(
                              onPressed: _submitWater,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF06B6D4),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('Add / Log', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Macros Dashboard Mini-card
                Card(
                  color: const Color(0xFF161C36),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Today Summary',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Calories: $totalCal / 2500 kcal',
                          style: const TextStyle(fontSize: 12),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Protein: ${totalProt}g | Carbs: ${totalCarbs}g | Fats: ${totalFats}g',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.white54,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Bug #5: Meal History with food item names
                if (todayMeals
                    .where(
                      (m) =>
                          !(m['foodItem']?.toString().toLowerCase().contains(
                                'water',
                              ) ??
                              false),
                    )
                    .isNotEmpty) ...[
                  const Text(
                    'Meal History',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 8),
                  ...todayMeals
                      .where(
                        (m) =>
                            !(m['foodItem']?.toString().toLowerCase().contains(
                                  'water',
                                ) ??
                                false),
                      )
                      .map((meal) {
                        final name = (meal['foodItem'] ?? meal['description'] ?? meal['name'] ?? 'Logged Meal').toString();
                        final cal = meal['calories'] ?? 0;
                        final prot = meal['protein'] ?? 0;
                        final carbs = meal['carbs'] ?? 0;
                        final fats = meal['fats'] ?? 0;
                        final category = (meal['mealCategory'] ?? 'Meal').toString();
                        final time = DateTime.tryParse(
                          meal['timestamp'] ?? meal['createdAt'] ?? '',
                        );
                        final timeStr = time != null
                            ? '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}'
                            : '';

                        return Card(
                          color: const Color(0xFF161C36),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
                          ),
                          margin: const EdgeInsets.only(bottom: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        name,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                          color: Colors.white,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        '$category${timeStr.isNotEmpty ? " · $timeStr" : ""}',
                                        style: const TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF10B981),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '$cal kcal   ·   P: ${prot}g   ·   C: ${carbs}g   ·   F: ${fats}g',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                ],
              ],
            ),
          ),

          // AI Parser Entry
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'AI Food NLP Logger',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _aiController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText:
                              'e.g. I ate 2 chapatis and chicken curry for lunch.',
                          filled: true,
                          fillColor: const Color(0xFF161C36),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    VoiceInputButton(
                      controller: _aiController,
                      accentColor: const Color(0xFF10B981),
                      onTranscriptionComplete: _parseAI,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _parsing ? null : _parseAI,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  icon: _parsing
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 1.5,
                          ),
                        )
                      : const Icon(Icons.auto_awesome, size: 16),
                  label: const Text('Parse Meal with AI'),
                ),
                if (_parsedResult != null) ...[
                  const SizedBox(height: 24),
                  Card(
                    color: const Color(0xFF0C0F20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(
                        color: const Color(0xFF10B981).withValues(alpha: 0.3),
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '🤖 AI Extracted Meal Details:',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF10B981),
                            ),
                          ),
                          const SizedBox(height: 12),
                          ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount:
                                (_parsedResult!['nutrition'] as List).length,
                            itemBuilder: (context, index) {
                              final item = _parsedResult!['nutrition'][index];
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 8.0),
                                child: Text(
                                  '• ${item['foodItem']}: ${item['calories']} kcal (Protein: ${item['protein']}g)',
                                  style: const TextStyle(fontSize: 13),
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton(
                                onPressed: () =>
                                    setState(() => _parsedResult = null),
                                child: const Text('Cancel'),
                              ),
                              const SizedBox(width: 12),
                              ElevatedButton(
                                onPressed: _confirmAI,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF10B981),
                                  foregroundColor: Colors.white,
                                ),
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
