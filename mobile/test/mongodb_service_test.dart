import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mobile/services/mongodb_service.dart';

void main() {
  test('sends authenticated requests to the configured API base', () async {
    final client = MockClient((request) async {
      expect(request.url.toString(), 'https://example.com/api/auth/profile');
      expect(request.headers['Authorization'], 'Bearer token123');
      return http.Response('{"ok": true}', 200);
    });

    final service = MongoDbService(
      baseUrl: 'https://example.com/api',
      client: client,
    );

    final result = await service.request(
      '/auth/profile',
      method: 'GET',
      token: 'token123',
    );

    expect(result['ok'], isTrue);
  });

  test('uses the Android emulator host by default', () {
    expect(
      MongoDbService.defaultBaseUrlForPlatform(isAndroid: true),
      'http://10.0.2.2:5000/api',
    );
  });

  test('uses localhost for web builds', () {
    expect(
      MongoDbService.defaultBaseUrlForPlatform(isWeb: true),
      'http://localhost:5000/api',
    );
  });
}
