import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../services/firebase_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _hospitalController = TextEditingController();
  final _deptController = TextEditingController();
  
  bool _isPhoneMode = false;
  bool _otpSent = false;
  String _verificationId = '';
  String _role = 'Doctor';
  String _error = '';
  bool _loading = false;

  void _handleRegister() async {
    if (_nameController.text.trim().isEmpty) {
      setState(() => _error = 'Full Name is required');
      return;
    }

    if (_isPhoneMode) {
      if (!_otpSent) {
        if (_phoneController.text.trim().isEmpty) {
          setState(() => _error = 'Please enter a valid mobile number');
          return;
        }
        _sendOtp();
      } else {
        _verifyOtp();
      }
      return;
    }

    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
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

  void _sendOtp() async {
    final raw = _phoneController.text.trim();
    final sanitized = FirebaseService.sanitizePhoneNumber(raw);

    if (sanitized.length < 12) {
      setState(() => _error = 'Please enter a valid 10-digit mobile number (e.g. 9876543210 or +919876543210)');
      return;
    }

    setState(() {
      _loading = true;
      _error = '';
    });

    final state = Provider.of<AppState>(context, listen: false);
    await state.sendPhoneOtp(
      phoneNumber: sanitized,
      onCodeSent: (verId) {
        if (mounted) {
          setState(() {
            _loading = false;
            _verificationId = verId;
            _otpSent = true;
          });
        }
      },
      onError: (err) {
        if (mounted) {
          setState(() {
            _loading = false;
            _error = err;
          });
        }
      },
    );
  }

  void _verifyOtp() async {
    if (_otpController.text.trim().length < 6) {
      setState(() => _error = 'Please enter the 6-digit OTP code');
      return;
    }

    setState(() {
      _loading = true;
      _error = '';
    });

    final state = Provider.of<AppState>(context, listen: false);
    final success = await state.confirmPhoneOtp(
      verificationId: _verificationId,
      smsCode: _otpController.text.trim(),
      name: _nameController.text.trim(),
      role: _role,
      hospital: _hospitalController.text.trim(),
      department: _deptController.text.trim(),
    );

    if (mounted) {
      setState(() => _loading = false);
      if (success) {
        Navigator.pushReplacementNamed(context, '/');
      } else {
        setState(() => _error = state.lastAuthError ?? 'OTP verification failed');
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
              const SizedBox(height: 16),
              
              // Auth Mode Toggle
              Row(
                children: [
                  Expanded(
                    child: ChoiceChip(
                      label: const Center(child: Text('✉️ Email Mode')),
                      selected: !_isPhoneMode,
                      onSelected: (val) {
                        if (val) setState(() { _isPhoneMode = false; _error = ''; _otpSent = false; });
                      },
                      selectedColor: const Color(0xFF06B6D4),
                      backgroundColor: const Color(0xFF161C36),
                      labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ChoiceChip(
                      label: const Center(child: Text('📱 Phone OTP')),
                      selected: _isPhoneMode,
                      onSelected: (val) {
                        if (val) setState(() { _isPhoneMode = true; _error = ''; _otpSent = false; });
                      },
                      selectedColor: const Color(0xFF8B5CF6),
                      backgroundColor: const Color(0xFF161C36),
                      labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),
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

              if (!_isPhoneMode) ...[
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
              ] else ...[
                if (!_otpSent)
                  TextField(
                    controller: _phoneController,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.phone_android, color: Colors.white38),
                      labelText: 'Mobile Number (e.g. 6382283784)',
                      helperText: 'Auto-formats 10-digit mobile numbers with +91 country code',
                      helperStyle: const TextStyle(color: Colors.white38, fontSize: 11),
                      filled: true,
                      fillColor: const Color(0xFF161C36),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    keyboardType: TextInputType.phone,
                  )
                else
                  TextField(
                    controller: _otpController,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.pin, color: Colors.white38),
                      labelText: '6-Digit OTP Code',
                      filled: true,
                      fillColor: const Color(0xFF161C36),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                  ),
                const SizedBox(height: 16),
              ],

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
                  backgroundColor: _isPhoneMode ? const Color(0xFF8B5CF6) : const Color(0xFF06B6D4),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: _loading 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text(
                      _isPhoneMode ? (_otpSent ? 'Verify OTP & Complete' : 'Send OTP & Register') : 'Register Profile',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
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
