import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const GuardianSyncApp());

    // Verify onboarding is active
    expect(find.text('GUARDIAN-SYNC'), findsWidgets);
  });
}
