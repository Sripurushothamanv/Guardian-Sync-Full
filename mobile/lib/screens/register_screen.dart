import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _hospitalController = TextEditingController();
  final _deptController = TextEditingController();
  
  String _role = 'Doctor';
  String _error = '';
  bool _loading = false;

  void _handleRegister() async {
    if (_nameController.text.isEmpty || _emailController.text.isEmpty || _passwordController.text.isEmpty) {
      setState(() => _error = 'Name, email, and password are required');
      return;
    }

    setState(() {
      _loading = true;
      _error = '';
    });

    final state = Provider.of<AppState>(context, listen: false);
    final success = await state.register(
      _nameController.text.trim(),
      _emailController.text.trim(),
      _passwordController.text.trim(),
      _role,
      _deptController.text.trim(),
      _hospitalController.text.trim(),
    );

    if (mounted) {
      setState(() => _loading = false);
      if (success) {
        Navigator.pushReplacementNamed(context, '/');
      } else {
        setState(() => _error = state.lastAuthError ?? 'Registration failed. Please try again.');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.query_stats, size: 48, color: Color(0xFF06B6D4)),
              const SizedBox(height: 16),
              const Text(
                'Create Profile',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              if (_error.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(_error, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                ),
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.person_outline, color: Colors.white38),
                  labelText: 'Full Name',
                  filled: true,
                  fillColor: const Color(0xFF161C36),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.mail_outline, color: Colors.white38),
                  labelText: 'Email Address',
                  filled: true,
                  fillColor: const Color(0xFF161C36),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.lock_outline, color: Colors.white38),
                  labelText: 'Password',
                  filled: true,
                  fillColor: const Color(0xFF161C36),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
                obscureText: true,
              ),
              const SizedBox(height: 16),
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
              const SizedBox(height: 16),
              TextField(
                controller: _hospitalController,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.business_outlined, color: Colors.white38),
                  labelText: 'Hospital / Clinic',
                  filled: true,
                  fillColor: const Color(0xFF161C36),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _deptController,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.local_hospital_outlined, color: Colors.white38),
                  labelText: 'Department',
                  filled: true,
                  fillColor: const Color(0xFF161C36),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _handleRegister,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF06B6D4),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: _loading 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Register Profile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Already have an account? ", style: TextStyle(color: Colors.white60)),
                  GestureDetector(
                    onTap: () => Navigator.pushReplacementNamed(context, '/login'),
                    child: const Text('Sign In', style: TextStyle(color: Color(0xFF06B6D4), fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
