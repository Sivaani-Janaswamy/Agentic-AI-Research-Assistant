import 'dart:io';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/paper.dart';

class ApiService {
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: 'https://beeresearch-backend.onrender.com',
      connectTimeout: const Duration(seconds: 60),
      receiveTimeout: const Duration(seconds: 60),
      sendTimeout: const Duration(seconds: 60),
    ),
  );

  ApiService() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        
        // Debugging log
        print('📡 [API REQUEST]: ${options.method} ${options.uri}');
        if (options.data != null) print('📦 [PAYLOAD]: ${options.data}');
        
        return handler.next(options);
      },
      onResponse: (response, handler) {
        print('✅ [API RESPONSE]: ${response.statusCode} from ${response.requestOptions.path}');
        return handler.next(response);
      },
      onError: (DioException e, handler) async {
        print('❌ [API ERROR]: ${e.type} | ${e.message}');
        if (e.response != null) {
          print('🔴 [SERVER ERROR]: ${e.response?.statusCode} | ${e.response?.data}');
        }

        // Retry logic for connection issues or cold starts
        if (shouldRetry(e)) {
          try {
            print('🔄 [RETRYING]...');
            return handler.resolve(await _retry(e.requestOptions));
          } catch (e) {
            return handler.next(e as DioException);
          }
        }
        return handler.next(e);
      },
    ));
  }

  bool shouldRetry(DioException e) {
    return e.type == DioExceptionType.connectionTimeout ||
           e.type == DioExceptionType.receiveTimeout ||
           (e.type == DioExceptionType.unknown && e.error is SocketException);
  }

  Future<Response> _retry(RequestOptions requestOptions) {
    final options = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
    );
    return _dio.request<dynamic>(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }

  // Auth Endpoints
  Future<AuthResponse> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/api/auth/login',
        data: FormData.fromMap({
          'username': email,
          'password': password,
        }),
      );
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<AuthResponse> signup(String email, String password, String fullName) async {
    try {
      final response = await _dio.post(
        '/api/auth/signup',
        data: {
          'email': email,
          'password': password,
          'full_name': fullName,
        },
      );
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Paper Endpoints
  Future<List<Paper>> getRecentPapers({int page = 1, int pageSize = 10}) async {
    try {
      final response = await _dio.get(
        '/api/papers/recent',
        queryParameters: {'page': page, 'page_size': pageSize},
      );
      final List items = response.data['items'] ?? [];
      return items.map((json) => Paper.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Paper>> searchPapers(String query, {int page = 1, int pageSize = 10}) async {
    try {
      final response = await _dio.get(
        '/api/papers/search',
        queryParameters: {'q': query, 'page': page, 'page_size': pageSize},
      );
      final List items = response.data['items'] ?? [];
      return items.map((json) => Paper.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Paper> getPaperDetails(String id) async {
    try {
      final response = await _dio.get('/api/papers/$id');
      return Paper.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Original Chat Endpoints
  Future<String> getChatResponse(String message) async {
    try {
      final response = await _dio.post(
        '/api/ask',
        data: {'question': message},
      );
      return response.data['answer'] ?? 'No response from AI';
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<bool> sendEmail(String content) async {
    try {
      final response = await _dio.post(
        '/api/papers/email',
        data: {'content': content},
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      final detail = e.response?.data['detail'];
      if (detail is String) return detail;
      return 'Server error: ${e.response?.statusCode}';
    }
    if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
      return 'Request timed out. The backend may be waking up (Render cold start). Please wait...';
    }
    return e.message ?? 'Network error occurred';
  }
}
