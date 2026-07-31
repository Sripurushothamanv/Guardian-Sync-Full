import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class WellnessGoalsScreen extends StatefulWidget {
  const WellnessGoalsScreen({super.key});

  @override
  State<WellnessGoalsScreen> createState() => _WellnessGoalsScreenState();
}

class _WellnessGoalsScreenState extends State<WellnessGoalsScreen> {
  void _showAddLogDialog(AppState state, Map<String, dynamic> goal) {
    final controller = TextEditingController();
    String unit = 'units';
    final type = goal['type'] ?? 'custom';
    if (type == 'sleep') {
      unit = 'hrs';
    } else if (type == 'caffeine') {
      unit = 'mg';
    } else if (type == 'water') {
      unit = 'ml';
    }

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161C36),
        title: Text('Log: ${goal['title']}', style: const TextStyle(fontSize: 15)),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Enter amount',
            suffixText: unit,
            filled: true,
            fillColor: const Color(0xFF0C0F20),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final amount = int.tryParse(controller.text) ?? 0;
              if (amount > 0) {
                state.addLogToGoal(goal['_id'], amount);
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('+$amount $unit logged!'), backgroundColor: const Color(0xFF10B981)),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B5CF6), foregroundColor: Colors.white),
            child: const Text('Log'),
          ),
        ],
      ),
    );
  }

  void _showAddGoalDialog(AppState state) {
    if (state.goals.length >= 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Maximum 5 goals reached. Delete one to add a new goal.'), backgroundColor: Color(0xFFEF4444)),
      );
      return;
    }

    final titleController = TextEditingController();
    final targetController = TextEditingController();
    String selectedType = 'custom';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF161C36),
          title: const Text('Add New Goal', style: TextStyle(fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: InputDecoration(
                  hintText: 'Goal name (e.g., Steps >= 10000)',
                  filled: true,
                  fillColor: const Color(0xFF0C0F20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: targetController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'Target value',
                  filled: true,
                  fillColor: const Color(0xFF0C0F20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0C0F20),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: selectedType,
                    isExpanded: true,
                    dropdownColor: const Color(0xFF0C0F20),
                    items: const [
                      DropdownMenuItem(value: 'custom', child: Text('📋 Custom')),
                      DropdownMenuItem(value: 'steps', child: Text('🚶 Steps')),
                      DropdownMenuItem(value: 'exercise', child: Text('💪 Exercise (mins)')),
                      DropdownMenuItem(value: 'water', child: Text('💧 Water (ml)')),
                    ],
                    onChanged: (val) {
                      if (val != null) setDialogState(() => selectedType = val);
                    },
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                final title = titleController.text.trim();
                final target = int.tryParse(targetController.text) ?? 0;
                if (title.isNotEmpty && target > 0) {
                  state.addGoal(title, selectedType, target);
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Goal created!'), backgroundColor: Color(0xFF10B981)),
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B5CF6), foregroundColor: Colors.white),
              child: const Text('Create'),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditGoalDialog(AppState state, Map<String, dynamic> goal) {
    final titleController = TextEditingController(text: goal['title'] ?? '');
    final targetController = TextEditingController(text: '${goal['targetValue'] ?? 0}');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161C36),
        title: const Text('Edit Goal', style: TextStyle(fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: InputDecoration(
                labelText: 'Goal Name',
                filled: true,
                fillColor: const Color(0xFF0C0F20),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: targetController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Target Value',
                filled: true,
                fillColor: const Color(0xFF0C0F20),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          if (goal['isCustom'] == true)
            TextButton(
              onPressed: () {
                state.deleteGoal(goal['_id']);
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Goal deleted.'), backgroundColor: Color(0xFFEF4444)),
                );
              },
              child: const Text('Delete', style: TextStyle(color: Color(0xFFEF4444))),
            ),
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final title = titleController.text.trim();
              final target = int.tryParse(targetController.text) ?? 0;
              if (title.isNotEmpty && target > 0) {
                state.editGoal(goal['_id'], title, target);
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Goal updated!'), backgroundColor: Color(0xFF10B981)),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B5CF6), foregroundColor: Colors.white),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final goals = state.goals;
    final streak = state.streakInfo;

    final streakCount = streak['streakCount'] ?? 0;
    final badges = streak['badges'] ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily Wellness Goals'),
        backgroundColor: const Color(0xFF0C0F20),
        actions: [
          if (goals.length < 5)
            IconButton(
              icon: const Icon(Icons.add_circle_outline, color: Color(0xFF8B5CF6)),
              onPressed: () => _showAddGoalDialog(state),
              tooltip: 'Add New Goal',
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Streak Card
          Card(
            color: const Color(0xFF161C36),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0x33EF4444), width: 1.5),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('🔥', style: TextStyle(fontSize: 18)),
                        Text('$streakCount', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Goal Streak: $streakCount Days', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        const Text('Log daily to maintain your adaptivity streaks.', style: TextStyle(fontSize: 11, color: Colors.white54)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Today Wellness Targets', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              Text('${goals.length}/5 goals', style: const TextStyle(fontSize: 11, color: Colors.white38)),
            ],
          ),
          const SizedBox(height: 8),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: goals.length,
            itemBuilder: (context, index) {
              final goal = goals[index];
              final bool completed = goal['completed'] ?? false;
              final num currentRaw = goal['currentValue'] ?? 0;
              final int current = currentRaw is double ? currentRaw.round() : currentRaw.toInt();
              final int target = (goal['targetValue'] ?? 1) is double
                  ? (goal['targetValue'] as double).round()
                  : (goal['targetValue'] ?? 1) as int;
              final double pct = (current / target).clamp(0.0, 1.0);

              return Card(
                color: const Color(0xFF161C36),
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 12,
                            backgroundColor: completed ? const Color(0xFF10B981) : Colors.white10,
                            child: completed ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(goal['title'] ?? 'Goal', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          ),
                          // Edit button
                          IconButton(
                            icon: const Icon(Icons.edit_outlined, size: 16, color: Colors.white38),
                            onPressed: () => _showEditGoalDialog(state, goal),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                          const SizedBox(width: 8),
                          // Add Log button
                          ElevatedButton(
                            onPressed: completed ? null : () => _showAddLogDialog(state, goal),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF8B5CF6),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              minimumSize: Size.zero,
                            ),
                            child: const Text('+ Add Log', style: TextStyle(fontSize: 11)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(3),
                        child: LinearProgressIndicator(
                          value: pct,
                          color: completed ? const Color(0xFF10B981) : const Color(0xFF8B5CF6),
                          backgroundColor: Colors.white10,
                          minHeight: 6,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text('$current / $target', style: const TextStyle(fontSize: 10, color: Colors.white54), textAlign: TextAlign.right),
                    ],
                  ),
                ),
              );
            },
          ),

          // Add Goal button at bottom
          if (goals.length < 5) ...[
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: () => _showAddGoalDialog(state),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: const Color(0xFF8B5CF6).withValues(alpha: 0.3)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.add, size: 16, color: Color(0xFF8B5CF6)),
              label: const Text('Add New Goal', style: TextStyle(color: Color(0xFF8B5CF6), fontWeight: FontWeight.bold)),
            ),
          ],
          const SizedBox(height: 20),

          const Text('Merit Badges & Awards', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.4,
            ),
            itemCount: badges.length,
            itemBuilder: (context, idx) {
              final badge = badges[idx];
              final bool unlocked = badge['unlocked'] ?? false;

              return Opacity(
                opacity: unlocked ? 1.0 : 0.45,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF161C36),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(badge['icon'] ?? '🏆', style: const TextStyle(fontSize: 22)),
                      const SizedBox(height: 4),
                      Text(badge['title'] ?? 'Badge', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12), textAlign: TextAlign.center),
                      Text(badge['description'] ?? '', style: const TextStyle(fontSize: 9, color: Colors.white54), textAlign: TextAlign.center, maxLines: 2),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
