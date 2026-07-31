import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform, SocketException, HandshakeException;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;

/// Exception thrown when a genuine network disconnect or socket failure occurs.
/// Callers should handle this by falling back to offline mode WITHOUT logging out.
class NetworkException implements Exception {
  final String message;
  NetworkException([this.message = 'Network error occurred.']);
  @override
  String toString() => 'NetworkException: $message';
}

/// Exception thrown ONLY when a user session/refresh token is explicitly revoked
/// or invalid (HTTP 403 / revoked session / disabled user).
class AuthRevokedException implements Exception {
  final String message;
  AuthRevokedException([this.message = 'Session or refresh token has been revoked.']);
  @override
  String toString() => 'AuthRevokedException: $message';
}

class ApiService {
  ApiService({String? baseUrl, http.Client? client})
    : _baseUrl = baseUrl ?? defaultBaseUrlForPlatform(),
      _client = client ?? http.Client();

  final String _baseUrl;
  final http.Client _client;

  static String defaultBaseUrlForPlatform({bool? isAndroid, bool? isWeb}) {
    final bool android = isAndroid ?? (!kIsWeb && Platform.isAndroid);
    final bool web = isWeb ?? kIsWeb;

    const int port = 5000;
    if (web) {
      return 'http://localhost:$port/api';
    }
    if (android) {
      return 'http://127.0.0.1:$port/api';
    }
    return 'http://localhost:$port/api';
  }

  Uri _buildUri(String path) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$_baseUrl$normalizedPath');
  }

  /// Silently retrieves a fresh token from Firebase Auth if current user exists,
  /// otherwise falls back to the explicitly supplied token.
  Future<String?> getFreshToken({String? fallbackToken, bool forceRefresh = false}) async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        final token = await user.getIdToken(forceRefresh);
        if (token != null && token.isNotEmpty) {
          return token;
        }
      }
    } catch (_) {
      // Ignore token refresh error; fallback to passed token
    }
    return fallbackToken;
  }

  Future<Map<String, dynamic>> request(
    String path, {
    required String method,
    String? token,
    Map<String, dynamic>? body,
    bool isRetry = false,
  }) async {
    final activeToken = await getFreshToken(fallbackToken: token);

    final headers = <String, String>{'Content-Type': 'application/json'};
    if (activeToken != null && activeToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $activeToken';
    }

    final requestBody = body == null ? null : jsonEncode(body);

    late http.Response response;
    try {
      switch (method.toUpperCase()) {
        case 'GET':
          response = await _client.get(_buildUri(path), headers: headers);
          break;
        case 'POST':
          response = await _client.post(
            _buildUri(path),
            headers: headers,
            body: requestBody,
          );
          break;
        case 'PUT':
          response = await _client.put(
            _buildUri(path),
            headers: headers,
            body: requestBody,
          );
          break;
        case 'PATCH':
          response = await _client.patch(
            _buildUri(path),
            headers: headers,
            body: requestBody,
          );
          break;
        case 'DELETE':
          response = await _client.delete(_buildUri(path), headers: headers);
          break;
        default:
          throw ArgumentError('Unsupported method: $method');
      }
    } on SocketException catch (e) {
      throw NetworkException('No Internet connection: ${e.message}');
    } on HandshakeException catch (e) {
      throw NetworkException('SSL Handshake error: ${e.message}');
    } on TimeoutException catch (e) {
      throw NetworkException('Request timed out: ${e.message}');
    } on http.ClientException catch (e) {
      throw NetworkException('HTTP client error: ${e.message}');
    } catch (e) {
      if (e is NetworkException || e is AuthRevokedException) rethrow;
      throw NetworkException('Network call failed: $e');
    }

    // Handle 401 Unauthorized with silent background token refresh & 1-time retry
    if (response.statusCode == 401 && !isRetry) {
      final refreshedToken = await getFreshToken(fallbackToken: token, forceRefresh: true);
      if (refreshedToken != null && refreshedToken != activeToken) {
        return request(
          path,
          method: method,
          token: refreshedToken,
          body: body,
          isRetry: true,
        );
      } else {
        // Refresh failed or token wasn't updated: check if session is explicitly revoked
        throw AuthRevokedException('Session expired and auto-refresh failed.');
      }
    }

    // Handle 403 Forbidden (Explicitly Revoked Session)
    if (response.statusCode == 403) {
      throw AuthRevokedException('Access forbidden: session revoked.');
    }

    if (response.body.isEmpty) {
      return {};
    }

    dynamic decoded;
    try {
      decoded = jsonDecode(response.body);
    } catch (_) {
      return {'raw': response.body};
    }

    if (decoded is Map<String, dynamic>) {
      return decoded;
    }

    return {'data': decoded};
  }
}
