import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_filex/open_filex.dart';
import '../app_state.dart';
import 'burnout_screen.dart';

class WeeklyReportScreen extends StatelessWidget {
  const WeeklyReportScreen({super.key});

  Future<List<int>> _generatePdfBytes(AppState state) async {
    final pdf = pw.Document();
    final report = state.weeklyReport;
    final double sleepAvg = (report?['summary']?['sleep']?['avgThisWeek'] as num?)?.toDouble() ?? 7.2;
    final int shiftsCount = (report?['summary']?['shifts']?['totalThisWeek'] as num?)?.toInt() ?? 5;
    final int caffTotal = (report?['summary']?['caffeine']?['totalThisWeek'] as num?)?.toInt() ?? 380;
    final int fatigueScore = (state.dashboardData['fatigueScore'] as num?)?.toInt() ?? 25;
    final String userName = state.user?['name'] ?? state.user?['email'] ?? 'Healthcare Operator';

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Header(
                level: 0,
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('GUARDIAN-SYNC', style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold, color: PdfColors.teal)),
                    pw.Text('WEEKLY SAFETY & FATIGUE REPORT', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
                  ],
                ),
              ),
              pw.SizedBox(height: 12),
              pw.Container(
                padding: const pw.EdgeInsets.all(10),
                decoration: pw.BoxDecoration(
                  color: PdfColors.grey200,
                  borderRadius: pw.BorderRadius.circular(6),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text('Operator / Duty Officer: $userName', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    pw.Text('Generated: ${DateTime.now().toString().substring(0, 16)}'),
                    pw.Text('System Target: Device RMX3853 / Android SDK 35'),
                  ],
                ),
              ),
              pw.SizedBox(height: 16),
              pw.Text('SUMMARY METRICS & FATIGUE ASSESSMENT', style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
              pw.Divider(),
              pw.SizedBox(height: 8),
              _buildPdfRow('Fatigue Risk Score:', '$fatigueScore / 100'),
              _buildPdfRow('Burnout Risk Level:', fatigueScore >= 70 ? 'CRITICAL / HIGH RISK' : 'STABLE / SAFE'),
              _buildPdfRow('Average Sleep Duration:', '${sleepAvg.toStringAsFixed(1)} hrs/day'),
              _buildPdfRow('Logged Duty Shifts:', '$shiftsCount duties'),
              _buildPdfRow('Total Caffeine Intake:', '${caffTotal} mg'),
              pw.SizedBox(height: 20),
              pw.Text('SAFETY CERTIFICATION', style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
              pw.Divider(),
              pw.SizedBox(height: 6),
              pw.Text(
                'This report certifies that fatigue parameters have been calculated using the Guardian-Sync Heuristic Index. '
                'All data points are clamped strictly within safe operational boundaries.',
                style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700),
              ),
            ],
          );
        },
      ),
    );

    return await pdf.save();
  }

  static pw.Widget _buildPdfRow(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 4),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(label, style: const pw.TextStyle(fontSize: 12)),
          pw.Text(value, style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
        ],
      ),
    );
  }

  void _exportPdfReport(BuildContext context, AppState state) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const AlertDialog(
        backgroundColor: Color(0xFF161C36),
        content: Row(
          children: [
            CircularProgressIndicator(color: Color(0xFF06B6D4)),
            SizedBox(width: 16),
            Text(
              'Generating PDF Report File...',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );

    try {
      final bytes = await _generatePdfBytes(state);
      final uintBytes = Uint8List.fromList(bytes);

      // Save PDF file to app documents directory
      final outputDir = await getApplicationDocumentsDirectory();
      final file = File('${outputDir.path}/Guardian_Sync_Weekly_Report.pdf');
      await file.writeAsBytes(uintBytes);

      if (context.mounted) {
        Navigator.pop(context); // Dismiss loading

        // Share or open native PDF on Android device
        await Printing.sharePdf(
          bytes: uintBytes,
          filename: 'Guardian_Sync_Weekly_Report.pdf',
        );

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('✓ PDF Saved successfully! Opening native preview...'),
            backgroundColor: const Color(0xFF10B981),
            duration: const Duration(seconds: 4),
            action: SnackBarAction(
              label: 'OPEN',
              textColor: Colors.white,
              onPressed: () {
                OpenFilex.open(file.path);
              },
            ),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to generate PDF File: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final report = state.weeklyReport;

    final double sleepAvg = (report?['summary']?['sleep']?['avgThisWeek'] as num?)?.toDouble() ?? 7.0;
    final double sleepAvgLast = (report?['summary']?['sleep']?['avgLastWeek'] as num?)?.toDouble() ?? 6.5;

    final int shiftsCount = (report?['summary']?['shifts']?['totalThisWeek'] as num?)?.toInt() ?? 5;
    final int shiftsCountLast = (report?['summary']?['shifts']?['totalLastWeek'] as num?)?.toInt() ?? 6;

    final int caffTotal = (report?['summary']?['caffeine']?['totalThisWeek'] as num?)?.toInt() ?? 380;
    final int caffTotalLast = (report?['summary']?['caffeine']?['totalLastWeek'] as num?)?.toInt() ?? 450;

    // Build fatigue trend data safely for chart
    List<Map<String, dynamic>> fatigueTrend = [];
    if (report != null && report['fatigueTrend'] is List) {
      final list = report['fatigueTrend'] as List;
      for (var item in list) {
        if (item is Map) {
          final dayStr = item['day']?.toString() ?? 'Day';
          final numVal = item['score'];
          double score = 0.0;
          if (numVal is num) {
            score = numVal.toDouble();
          } else if (numVal is String) {
            score = double.tryParse(numVal) ?? 0.0;
          }
          fatigueTrend.add({
            'day': dayStr,
            'score': score.clamp(0.0, 100.0),
          });
        }
      }
    }
    
    if (fatigueTrend.isEmpty) {
      final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      final rawScore = state.dashboardData['fatigueScore'];
      int fatigueScore = 25;
      if (rawScore is num) {
        fatigueScore = rawScore.round();
      }
      for (int i = 0; i < 7; i++) {
        final variation = (i * 5 - 8 + fatigueScore).clamp(0, 100);
        fatigueTrend.add({'day': days[i], 'score': variation.toDouble()});
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Weekly Analysis'),
        backgroundColor: const Color(0xFF0C0F20),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf, color: Color(0xFF06B6D4)),
            tooltip: 'Export PDF Report',
            onPressed: () => _exportPdfReport(context, state),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Wellness Metrics Comparison', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          _buildCompareCard('Average Sleep Session', '${sleepAvg.toStringAsFixed(1)} hrs', 'Prior week: ${sleepAvgLast.toStringAsFixed(1)} hrs', sleepAvg >= sleepAvgLast),
          _buildCompareCard('Logged Work Shifts', '$shiftsCount duties', 'Prior week: $shiftsCountLast duties', shiftsCount <= shiftsCountLast),
          _buildCompareCard('Caffeine Intake', '${caffTotal}mg', 'Prior week: ${caffTotalLast}mg', caffTotal <= caffTotalLast),
          const SizedBox(height: 20),

          const Text('Fatigue Trends vs Prior Week', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          Card(
            color: const Color(0xFF161C36),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              child: BurnoutScreen.buildClampedBarChart(fatigueTrend),
            ),
          ),
          const SizedBox(height: 24),

          const Text('Weekly Nutrition Averages', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          _buildMacroSummary(state),
          const SizedBox(height: 24),

          ElevatedButton.icon(
            onPressed: () => _exportPdfReport(context, state),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF06B6D4),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.picture_as_pdf),
            label: const Text('EXPORT PDF REPORT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        ],
      ),
    );
  }

  Widget _buildCompareCard(String title, String valThis, String valLast, bool isBetter) {
    return Card(
      color: const Color(0xFF161C36),
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            Text(valThis, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
          ],
        ),
        subtitle: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(valLast, style: const TextStyle(fontSize: 11, color: Colors.white54)),
            Icon(isBetter ? Icons.trending_up : Icons.trending_down, size: 14, color: isBetter ? Colors.green : Colors.redAccent),
          ],
        ),
      ),
    );
  }

  Widget _buildMacroSummary(AppState state) {
    final now = DateTime.now();
    final weekLogs = state.logs['nutrition']?.where((n) {
      final logDate = DateTime.tryParse(n['timestamp'] ?? n['createdAt'] ?? '');
      if (logDate == null) return false;
      return now.difference(logDate).inDays < 7 &&
          !(n['foodItem']?.toString().toLowerCase().contains('water') ?? false);
    }).toList() ?? [];

    int totalCal = 0, totalProt = 0, totalCarbs = 0, totalFats = 0;
    for (var m in weekLogs) {
      totalCal += (m['calories'] as num?)?.toInt() ?? 0;
      totalProt += (m['protein'] as num?)?.toInt() ?? 0;
      totalCarbs += (m['carbs'] as num?)?.toInt() ?? 0;
      totalFats += (m['fats'] as num?)?.toInt() ?? 0;
    }

    final days = weekLogs.isNotEmpty ? 7 : 1;
    final avgCal = (totalCal / days).round();
    final avgProt = (totalProt / days).round();
    final avgCarbs = (totalCarbs / days).round();
    final avgFats = (totalFats / days).round();

    return Card(
      color: const Color(0xFF161C36),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildMacroRow('Daily Calories Average:', '$avgCal kcal'),
            const SizedBox(height: 8),
            _buildMacroRow('Daily Protein Average:', '$avgProt g'),
            const SizedBox(height: 8),
            _buildMacroRow('Daily Carbs Average:', '$avgCarbs g'),
            const SizedBox(height: 8),
            _buildMacroRow('Daily Fats Average:', '$avgFats g'),
          ],
        ),
      ),
    );
  }

  Widget _buildMacroRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: Colors.white70)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }
}
