import 'dart:convert';
import 'package:http/http.dart' as http;

class MongoDbService {
  MongoDbService({String? baseUrl, http.Client? client})
    : _baseUrl = baseUrl ?? defaultBaseUrlForPlatform(),
      _client = client ?? http.Client();

  final String _baseUrl;
  final http.Client _client;

  static String defaultBaseUrlForPlatform({bool? isAndroid, bool? isWeb}) {
    final android = isAndroid ?? false;
    final web = isWeb ?? false;

    if (android) {
      return 'http://10.0.2.2:5000/api';
    }

    if (web) {
      return 'http://localhost:5000/api';
    }

    return 'http://10.0.2.2:5000/api';
  }

  Uri _buildUri(String path) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$_baseUrl$normalizedPath');
  }

  Future<Map<String, dynamic>> request(
    String path, {
    required String method,
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    final requestBody = body == null ? null : jsonEncode(body);

    late http.Response response;
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

    if (response.body.isEmpty) {
      return {};
    }

    final decoded = jsonDecode(response.body);
    if (decoded is Map<String, dynamic>) {
      return decoded;
    }

    return {'data': decoded};
  }
}
