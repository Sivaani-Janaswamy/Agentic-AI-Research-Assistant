import 'package:flutter/material.dart';

class FeaturePill extends StatelessWidget {
  final String label;

  const FeaturePill({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: Colors.grey[800],
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
