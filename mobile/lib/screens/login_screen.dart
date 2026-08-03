import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../services/firebase_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();

  bool _isPhoneMode = false;
  bool _otpSent = false;
  String _verificationId = '';
  String _error = '';
  bool _loading = false;

  void _handleEmailLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      setState(() => _error = 'Please enter email and password');
      return;
    }

    setState(() {
      _loading = true;
      _error = '';
    });

    final state = Provider.of<AppState>(context, listen: false);
    final success = await state.login(_emailController.text.trim(), _passwordController.text.trim());

    if (mounted) {
      setState(() => _loading = false);
      if (success) {
        Navigator.pushReplacementNamed(context, '/');
      } else {
        setState(() => _error = state.lastAuthError ?? 'Invalid credentials');
      }
    }
  }

  void _sendOtp() async {
    final raw = _phoneController.text.trim();
    final sanitized = FirebaseService.sanitizePhoneNumber(raw);

    if (sanitized.length < 12) {
      setState(() => _error = 'Please enter a valid 10-digit mobile number (e.g. 6382283784 or +916382283784)');
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
              const Icon(Icons.query_stats, size: 64, color: Color(0xFF8B5CF6)),
              const SizedBox(height: 16),
              const Text(
                'GUARDIAN-SYNC',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: 1.5, color: Colors.white),
                textAlign: TextAlign.center,
              ),
              const Text(
                'Healthcare Fatigue Tracking',
                style: TextStyle(fontSize: 14, color: Colors.white70),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // Auth Mode Switcher
              Row(
                children: [
                  Expanded(
                    child: ChoiceChip(
                      label: const Center(child: Text('✉️ Email Login')),
                      selected: !_isPhoneMode,
                      onSelected: (val) {
                        if (val) setState(() { _isPhoneMode = false; _error = ''; _otpSent = false; });
                      },
                      selectedColor: const Color(0xFF8B5CF6),
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
                      selectedColor: const Color(0xFF06B6D4),
                      backgroundColor: const Color(0xFF161C36),
                      labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
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
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: Colors.redAccent, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(_error, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                      ),
                    ],
                  ),
                ),

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
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/forgot-password'),
                    child: const Text('Forgot Password?', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 13)),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _loading ? null : _handleEmailLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B5CF6),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: _loading 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ] else ...[
                if (!_otpSent) ...[
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
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _loading ? null : _sendOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF06B6D4),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _loading 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Send SMS OTP', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ] else ...[
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
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _loading ? null : _verifyOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _loading 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Verify OTP & Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ],
              ],

              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Don't have an account? ", style: TextStyle(color: Colors.white60)),
                  GestureDetector(
                    onTap: () => Navigator.pushReplacementNamed(context, '/register'),
                    child: const Text('Sign Up', style: TextStyle(color: Color(0xFF8B5CF6), fontWeight: FontWeight.bold)),
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
