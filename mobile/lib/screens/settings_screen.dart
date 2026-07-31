import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _shiftRem = true;
  bool _caffCut = true;
  bool _burnWarn = true;
  bool _driveAlert = true;

  void _clearData() async {
    final state = Provider.of<AppState>(context, listen: false);
    
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Database Reset'),
        content: const Text('Are you sure you want to delete all local tracking logs? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Reset', style: TextStyle(color: Colors.redAccent))),
        ],
      ),
    );

    if (confirm == true) {
      // Clear local storage logs
      state.logout();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Database reset complete. Signed out.')),
        );
        Navigator.pushReplacementNamed(context, '/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('System Settings'), backgroundColor: const Color(0xFF0C0F20)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Push Alerts Preferences', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          _buildSwitchTile('Shift curfews reminders', 'Alerts 1h before starting duty shifts.', _shiftRem, (val) => setState(() => _shiftRem = val)),
          _buildSwitchTile('Caffeine curfews cutoffs', 'Warnings when coffee saturation exceeds limit.', _caffCut, (val) => setState(() => _caffCut = val)),
          _buildSwitchTile('Burnout alarms thresholds', 'Warns if average fatigue exceeds 70% threshold.', _burnWarn, (val) => setState(() => _burnWarn = val)),
          _buildSwitchTile('Driving safety checks', 'Driving alerts at the end of night shifts.', _driveAlert, (val) => setState(() => _driveAlert = val)),
          const SizedBox(height: 24),
          
          const Text('Diagnostics & Data Management', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          Card(
            color: const Color(0xFF161C36),
            child: ListTile(
              leading: const Icon(Icons.delete_forever_outlined, color: Colors.redAccent),
              title: const Text('Wipe Local Logs Database', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('Delete cached shift, sleep, and macro records.', style: TextStyle(fontSize: 11, color: Colors.white54)),
              onTap: _clearData,
            ),
          ),
          Card(
            color: const Color(0xFF161C36),
            child: ListTile(
              leading: const Icon(Icons.logout, color: Colors.white60),
              title: const Text('Sign out of Portal', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              onTap: () {
                state.logout();
                Navigator.pushReplacementNamed(context, '/login');
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchTile(String title, String desc, bool value, ValueChanged<bool> onChanged) {
    return Card(
      color: const Color(0xFF161C36),
      margin: const EdgeInsets.only(bottom: 10),
      child: SwitchListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        subtitle: Text(desc, style: const TextStyle(fontSize: 11, color: Colors.white54)),
        value: value,
        activeThumbColor: const Color(0xFF8B5CF6),
        onChanged: onChanged,
      ),
    );
  }
}
