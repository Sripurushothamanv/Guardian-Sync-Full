import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nameController = TextEditingController();
  final _hospitalController = TextEditingController();
  final _deptController = TextEditingController();
  
  String _role = 'Doctor';

  bool _initialized = false;
  bool _saving = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      final state = Provider.of<AppState>(context);
      final user = state.user;
      if (user != null) {
        _nameController.text = user['name'] ?? '';
        _role = user['role'] ?? 'Doctor';
        _hospitalController.text = user['hospital'] ?? '';
        _deptController.text = user['department'] ?? '';
        _initialized = true;
      }
    }
  }

  void _saveProfile() async {
    setState(() => _saving = true);
    final state = Provider.of<AppState>(context, listen: false);

    await state.updateProfile({
      'name': _nameController.text.trim(),
      'role': _role,
      'hospital': _hospitalController.text.trim(),
      'department': _deptController.text.trim(),
    });

    setState(() => _saving = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Preferences saved successfully!'), backgroundColor: Color(0xFF10B981)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Professional Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.person_outline),
                labelText: 'Full Name',
                filled: true,
                fillColor: const Color(0xFF161C36),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF161C36),
                borderRadius: BorderRadius.circular(10),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _role,
                  isExpanded: true,
                  dropdownColor: const Color(0xFF0C0F20),
                  items: const [
                    DropdownMenuItem(value: 'Doctor', child: Text('👨‍⚕️ Doctor')),
                    DropdownMenuItem(value: 'Nurse', child: Text('👩‍⚕️ Nurse')),
                    DropdownMenuItem(value: 'Intern', child: Text('🩺 Medical Intern')),
                    DropdownMenuItem(value: 'Night-Shift Staff', child: Text('🌙 Night-Shift Staff')),
                    DropdownMenuItem(value: 'Other', child: Text('Other Staff')),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _role = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _hospitalController,
                    decoration: InputDecoration(labelText: 'Hospital', filled: true, fillColor: const Color(0xFF161C36), border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _deptController,
                    decoration: InputDecoration(labelText: 'Department', filled: true, fillColor: const Color(0xFF161C36), border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _saving ? null : _saveProfile,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B5CF6),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _saving 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Save Configuration', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
