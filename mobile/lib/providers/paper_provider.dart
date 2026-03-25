import 'package:flutter/material.dart';
import '../models/paper.dart';
import '../services/api_service.dart';

class PaperProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Paper> _recentPapers = [];
  List<Paper> _searchResults = [];
  bool _isLoadingRecent = false;
  bool _isLoadingSearch = false;
  String? _error;

  List<Paper> get recentPapers => _recentPapers;
  List<Paper> get searchResults => _searchResults;
  bool get isLoadingRecent => _isLoadingRecent;
  bool get isLoadingSearch => _isLoadingSearch;
  String? get error => _error;

  Future<void> fetchRecentPapers() async {
    _isLoadingRecent = true;
    _error = null;
    notifyListeners();

    try {
      _recentPapers = await _apiService.getRecentPapers();
      _isLoadingRecent = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoadingRecent = false;
      notifyListeners();
    }
  }

  Future<void> searchPapers(String query) async {
    if (query.isEmpty) {
      _searchResults = [];
      notifyListeners();
      return;
    }

    _isLoadingSearch = true;
    _error = null;
    notifyListeners();

    try {
      _searchResults = await _apiService.searchPapers(query);
      _isLoadingSearch = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoadingSearch = false;
      notifyListeners();
    }
  }

  Future<Paper> getPaperDetails(String id) async {
    try {
      return await _apiService.getPaperDetails(id);
    } catch (e) {
      rethrow;
    }
  }
}
