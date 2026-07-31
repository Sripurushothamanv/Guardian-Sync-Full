import 'package:flutter/material.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentIndex = 0;

  final List<Map<String, dynamic>> _slides = [
    {
      'title': 'Smart Fatigue Predictor',
      'description': 'Our mathematical algorithm tracks sleep debt, active shifts, awake time, and caffeine intake to calculate your current exhaustion levels.',
      'icon': Icons.psychology_outlined,
      'color': Color(0xFF8B5CF6),
      'badge': 'BIOMEDICAL HEURISTICS'
    },
    {
      'title': 'Dual Input Loggers',
      'description': 'Busy after a 12h duty? Simply dictate or type a single sentence: "worked night shift, slept 5h, had 2 coffees". The AI logs it instantly.',
      'icon': Icons.auto_awesome_outlined,
      'color': Color(0xFF06B6D4),
      'badge': 'NATURAL NLP'
    },
    {
      'title': 'Safe-To-Drive Alerts',
      'description': 'Receive color-coded notifications evaluating if you are safe to drive home. Test your cognitive latencies with our reaction speed test.',
      'icon': Icons.directions_car_outlined,
      'color': Color(0xFF10B981),
      'badge': 'LIFE-SAVING DRIVING CHECKS'
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        padding: const EdgeInsets.all(24.0),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF070913), Color(0xFF0C0F20)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.query_stats, color: Color(0xFF8B5CF6)),
                      SizedBox(width: 8),
                      Text('GUARDIAN-SYNC', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                    ],
                  ),
                  TextButton(
                    onPressed: () => Navigator.pushReplacementNamed(context, '/register'),
                    child: const Text('Skip', style: TextStyle(color: Colors.white60)),
                  ),
                ],
              ),
              Expanded(
                child: PageView.builder(
                  controller: _controller,
                  onPageChanged: (idx) => setState(() => _currentIndex = idx),
                  itemCount: _slides.length,
                  itemBuilder: (context, idx) {
                    final slide = _slides[idx];
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: slide['color'].withOpacity(0.08),
                            shape: BoxShape.circle,
                            border: Border.all(color: slide['color'].withOpacity(0.2), width: 2),
                          ),
                          child: Icon(slide['icon'], size: 54, color: slide['color']),
                        ),
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: slide['color'].withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            slide['badge'],
                            style: TextStyle(color: slide['color'], fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          slide['title'],
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            slide['description'],
                            style: const TextStyle(fontSize: 14, color: Colors.white70, height: 1.4),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: List.generate(
                      _slides.length,
                      (idx) => Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: _currentIndex == idx ? 18 : 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: _currentIndex == idx ? _slides[_currentIndex]['color'] : Colors.white24,
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      if (_currentIndex < _slides.length - 1) {
                        _controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
                      } else {
                        Navigator.pushReplacementNamed(context, '/register');
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _slides[_currentIndex]['color'],
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                    child: Row(
                      children: [
                        Text(_currentIndex == _slides.length - 1 ? 'Get Started' : 'Next'),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward, size: 16),
                      ],
                    ),
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
