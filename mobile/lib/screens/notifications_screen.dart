import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  IconData _getIcon(String type) {
    if (type == 'burnout') return Icons.shield_outlined;
    if (type == 'caffeine_cutoff') return Icons.coffee_outlined;
    if (type == 'drive_warning') return Icons.directions_car_outlined;
    return Icons.notifications_none_outlined;
  }

  Color _getColor(String type) {
    if (type == 'burnout') return Colors.redAccent;
    if (type == 'caffeine_cutoff') return const Color(0xFF06B6D4);
    if (type == 'drive_warning') return const Color(0xFFF59E0B);
    return const Color(0xFF8B5CF6);
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final notifications = state.notifications;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications History'),
        backgroundColor: const Color(0xFF0C0F20),
        actions: [
          if (notifications.isNotEmpty) ...[
            IconButton(
              icon: const Icon(Icons.check_circle_outline, size: 20),
              tooltip: 'Mark All Read',
              onPressed: state.markAllNotificationsRead,
            ),
            IconButton(
              icon: const Icon(Icons.delete_sweep_outlined, size: 20),
              tooltip: 'Clear All',
              onPressed: state.clearNotifications,
            ),
          ],
        ],
      ),
      body: notifications.isNotEmpty
        ? ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final notif = notifications[index];
              final bool read = notif['read'] ?? false;
              final String type = notif['type'] ?? 'general';
              final Color color = _getColor(type);

              return Card(
                color: const Color(0xFF161C36),
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: read ? Colors.transparent : color.withValues(alpha: 0.3), width: 1),
                ),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: color.withValues(alpha: 0.15),
                    child: Icon(_getIcon(type), color: color, size: 20),
                  ),
                  title: Text(
                    type.replaceAll('_', ' ').toUpperCase(),
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: color, letterSpacing: 0.5),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 4),
                      Text(
                        notif['message'] ?? '',
                        style: TextStyle(fontSize: 13, color: read ? Colors.white54 : Colors.white, height: 1.35),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        notif['timestamp'] != null 
                          ? DateTime.parse(notif['timestamp']).toLocal().toString().substring(11, 16)
                          : '',
                        style: const TextStyle(fontSize: 9, color: Colors.white30),
                        textAlign: TextAlign.right,
                      ),
                    ],
                  ),
                  onTap: () {
                    if (!read) state.markNotificationRead(notif['_id']);
                  },
                ),
              );
            },
          )
        : const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.notifications_off_outlined, size: 48, color: Colors.white24),
                SizedBox(height: 12),
                Text('No Alerts', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white60)),
                Text('Circadian parameters synchronizing normally.', style: TextStyle(fontSize: 11, color: Colors.white38)),
              ],
            ),
          ),
    );
  }
}
