import 'package:flutter/material.dart';
import '../models/chat_message.dart';
import '../services/api_service.dart';

class ChatProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;

  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    // Add user message
    _messages.add(ChatMessage(text: text, type: MessageType.user));
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.getChatResponse(text);
      _messages.add(ChatMessage(text: response, type: MessageType.ai));
    } catch (e) {
      _messages.add(ChatMessage(
        text: 'Sorry, I encountered an error: ${e.toString()}',
        type: MessageType.ai,
      ));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> shareByEmail(String content) async {
    try {
      return await _apiService.sendEmail(content);
    } catch (e) {
      return false;
    }
  }

  void clearChat() {
    _messages.clear();
    notifyListeners();
  }
}
