import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

/// Reusable voice input button widget with animated microphone icon.
/// Wraps speech_to_text for tap-to-speak, real-time transcription.
class VoiceInputButton extends StatefulWidget {
  final TextEditingController controller;
  final VoidCallback? onTranscriptionComplete;
  final Color accentColor;

  const VoiceInputButton({
    super.key,
    required this.controller,
    this.onTranscriptionComplete,
    this.accentColor = const Color(0xFF8B5CF6),
  });

  @override
  State<VoiceInputButton> createState() => _VoiceInputButtonState();
}

class _VoiceInputButtonState extends State<VoiceInputButton>
    with SingleTickerProviderStateMixin {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;
  bool _isAvailable = false;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.35).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    try {
      _isAvailable = await _speech.initialize(
        onStatus: (status) {
          if (status == 'done' || status == 'notListening') {
            if (mounted && _isListening) {
              setState(() => _isListening = false);
              _pulseController.stop();
              _pulseController.reset();
              if (widget.controller.text.trim().isNotEmpty) {
                widget.onTranscriptionComplete?.call();
              }
            }
          }
        },
        onError: (error) {
          if (mounted) {
            setState(() => _isListening = false);
            _pulseController.stop();
            _pulseController.reset();
          }
        },
      );
    } catch (_) {
      _isAvailable = false;
    }
    if (mounted) setState(() {});
  }

  void _toggleListening() async {
    if (!_isAvailable) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Speech recognition initializing or permission required.'),
            backgroundColor: Colors.amber,
          ),
        );
      }
      await _initSpeech();
      return;
    }

    if (_isListening) {
      await _speech.stop();
      setState(() => _isListening = false);
      _pulseController.stop();
      _pulseController.reset();
      if (widget.controller.text.trim().isNotEmpty) {
        widget.onTranscriptionComplete?.call();
      }
    } else {
      setState(() => _isListening = true);
      _pulseController.repeat(reverse: true);
      await _speech.listen(
        onResult: (result) {
          if (mounted) {
            widget.controller.text = result.recognizedWords;
            widget.controller.selection = TextSelection.fromPosition(
              TextPosition(offset: widget.controller.text.length),
            );
          }
        },
        listenFor: const Duration(seconds: 30),
        pauseFor: const Duration(seconds: 3),
        localeId: 'en_IN',
      );
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _speech.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        return GestureDetector(
          onTap: _toggleListening,
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: _isListening
                  ? widget.accentColor.withValues(alpha: 0.25)
                  : widget.accentColor.withValues(alpha: 0.15),
              border: Border.all(
                color: _isListening
                    ? widget.accentColor
                    : widget.accentColor.withValues(alpha: 0.5),
                width: _isListening ? 2 : 1,
              ),
              boxShadow: _isListening
                  ? [
                      BoxShadow(
                        color: widget.accentColor.withValues(alpha: 0.4),
                        blurRadius: 12 * _pulseAnimation.value,
                        spreadRadius: 2 * _pulseAnimation.value,
                      ),
                    ]
                  : null,
            ),
            child: Icon(
              _isListening ? Icons.mic : Icons.mic_none_rounded,
              color: _isListening ? widget.accentColor : widget.accentColor.withValues(alpha: 0.9),
              size: 22,
            ),
          ),
        );
      },
    );
  }
}
