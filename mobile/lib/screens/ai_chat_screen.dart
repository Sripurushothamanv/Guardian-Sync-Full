import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../widgets/voice_input_button.dart';

class AIChatScreen extends StatefulWidget {
  const AIChatScreen({super.key});

  @override
  State<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final List<Map<String, dynamic>> _messages = [
    {
      'id': 'welcome',
      'sender': 'bot',
      'text': "Hello! I am your Guardian-Sync AI assistant. Speak or type to log your day or ask questions, e.g:\n\n*\"I finished a 12-hour night shift, drank 2 coffees, and slept 5 hours\"*\n*\"Am I safe to drive right now?\"*",
      'timestamp': DateTime.now()
    }
  ];

  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  bool _loading = false;

  void _sendMessage() async {
    if (_textController.text.trim().isEmpty) return;
    
    final text = _textController.text.trim();
    _textController.clear();

    setState(() {
      _messages.add({
        'id': 'user_${DateTime.now().millisecondsSinceEpoch}',
        'sender': 'user',
        'text': text,
        'timestamp': DateTime.now()
      });
      _loading = true;
    });

    _scrollToBottom();

    final state = Provider.of<AppState>(context, listen: false);
    final parsed = await state.addAILog(text);

    setState(() => _loading = false);

    if (parsed != null && (parsed['sleep'] != null || parsed['caffeine'] != null || parsed['shift'] != null || (parsed['nutrition'] as List).isNotEmpty)) {
      setState(() {
        _messages.add({
          'id': 'bot_${DateTime.now().millisecondsSinceEpoch}',
          'sender': 'bot',
          'text': 'I extracted wellness records from your prompt. Please confirm below:',
          'payload': parsed,
          'timestamp': DateTime.now()
        });
      });
    } else {
      final String aiReply = state.getAIChatResponse(text);
      setState(() {
        _messages.add({
          'id': 'bot_${DateTime.now().millisecondsSinceEpoch}',
          'sender': 'bot',
          'text': aiReply,
          'timestamp': DateTime.now()
        });
      });
    }
    _scrollToBottom();
  }

  void _confirmExtraction(Map<String, dynamic> payload, String msgId) async {
    final state = Provider.of<AppState>(context, listen: false);
    
    setState(() => _loading = true);
    await state.confirmAILog(payload);
    setState(() => _loading = false);

    setState(() {
      final index = _messages.indexWhere((m) => m['id'] == msgId);
      if (index != -1) {
        _messages[index] = {
          ..._messages[index],
          'text': 'Confirmed! Logs committed to database successfully. 🚀 Fatigue indices updated.',
          'payload': null
        };
      }
    });
    _scrollToBottom();
  }

  void _discardExtraction(String msgId) {
    setState(() {
      final index = _messages.indexWhere((m) => m['id'] == msgId);
      if (index != -1) {
        _messages[index] = {
          ..._messages[index],
          'text': 'Logs discarded.',
          'payload': null
        };
      }
    });
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (context, idx) {
                  final msg = _messages[idx];
                  final isBot = msg['sender'] == 'bot';
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: isBot ? MainAxisAlignment.start : MainAxisAlignment.end,
                      children: [
                        if (isBot) ...[
                          CircleAvatar(
                            radius: 14,
                            backgroundColor: const Color(0xFF06B6D4).withValues(alpha: 0.15),
                            child: const Icon(Icons.smart_toy_outlined, size: 14, color: Color(0xFF06B6D4)),
                          ),
                          const SizedBox(width: 8),
                        ],
                        Expanded(
                          child: Column(
                            crossAxisAlignment: isBot ? CrossAxisAlignment.start : CrossAxisAlignment.end,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: isBot ? const Color(0xFF161C36) : const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                                  border: Border.all(color: isBot ? Colors.white.withValues(alpha: 0.04) : const Color(0xFF8B5CF6).withValues(alpha: 0.3)),
                                  borderRadius: BorderRadius.only(
                                    topLeft: const Radius.circular(12),
                                    topRight: const Radius.circular(12),
                                    bottomLeft: isBot ? Radius.zero : const Radius.circular(12),
                                    bottomRight: isBot ? const Radius.circular(12) : Radius.zero,
                                  ),
                                ),
                                child: Text(
                                  msg['text'] ?? '',
                                  style: const TextStyle(fontSize: 13, height: 1.4),
                                ),
                              ),
                              if (msg['payload'] != null)
                                _buildExtractionBox(msg['payload'], msg['id']),
                            ],
                          ),
                        ),
                        if (!isBot) ...[
                          const SizedBox(width: 8),
                          CircleAvatar(
                            radius: 14,
                            backgroundColor: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                            child: const Icon(Icons.person, size: 14, color: Color(0xFF8B5CF6)),
                          ),
                        ]
                      ],
                    ),
                  );
                },
              ),
            ),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                    SizedBox(width: 8),
                    Text('Processing inputs...', style: TextStyle(fontSize: 11, color: Colors.white54)),
                  ],
                ),
              ),
            Container(
              padding: const EdgeInsets.all(12),
              color: const Color(0xFF0C0F20),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      decoration: InputDecoration(
                        hintText: 'Ask AI or speak e.g. "Am I safe to drive?"...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                        filled: true,
                        fillColor: const Color(0xFF161C36),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  VoiceInputButton(
                    controller: _textController,
                    accentColor: const Color(0xFF06B6D4),
                    onTranscriptionComplete: _sendMessage,
                  ),
                  const SizedBox(width: 4),
                  IconButton(
                    icon: const Icon(Icons.send, color: Color(0xFF8B5CF6)),
                    onPressed: _sendMessage,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExtractionBox(Map<String, dynamic> payload, String msgId) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF070913),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF06B6D4).withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('🔍 CONFIRM EXTRACTION:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF06B6D4))),
          const SizedBox(height: 8),
          if (payload['sleep'] != null)
            Text('🛌 Sleep: ${payload['sleep']['duration']}h (${payload['sleep']['quality']})', style: const TextStyle(fontSize: 12)),
          if (payload['caffeine'] != null)
            Text('☕ Caffeine: ${payload['caffeine']['mgAmount']}mg (${payload['caffeine']['beverage']})', style: const TextStyle(fontSize: 12)),
          if (payload['shift'] != null)
            Text('⏱️ Shift: ${payload['shift']['duration']}h (${payload['shift']['shiftType']} Shift)', style: const TextStyle(fontSize: 12)),
          if (payload['nutrition'] != null && (payload['nutrition'] as List).isNotEmpty)
            Text('🍲 Nutrition: ${payload['nutrition'].map((n) => n['foodItem']).join(', ')}', style: const TextStyle(fontSize: 12)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => _discardExtraction(msgId),
                child: const Text('Discard', style: TextStyle(fontSize: 12, color: Colors.white54)),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () => _confirmExtraction(payload, msgId),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF06B6D4), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16)),
                child: const Text('Log All', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
