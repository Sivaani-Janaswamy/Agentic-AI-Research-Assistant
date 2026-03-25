import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../widgets/feature_pills.dart';
import 'chat_screen.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'BeeResearch',
          style: GoogleFonts.poppins(
            color: Colors.black87,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu, color: Colors.black87),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              // Hero Section
              Text(
                'AGENTIC AI RESEARCH ASSISTANT',
                style: GoogleFonts.inter(
                  color: const Color(0xFF7C4DFF),
                  letterSpacing: 1.2,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Turn papers into insights with BeeResearch.',
                style: GoogleFonts.poppins(
                  color: Colors.black,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Your intelligent companion for analyzing academic papers, discovering trends, and streamlining your research workflow.',
                style: GoogleFonts.inter(
                  color: Colors.grey[600],
                  fontSize: 16,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ChatScreen()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF7C4DFF),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Text('Start exploring'),
                  ),
                  const SizedBox(width: 12),
                  OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 16),
                      side: const BorderSide(color: Colors.grey),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('Sign up / Log in'),
                  ),
                ],
              ),
              const SizedBox(height: 48),
              // Feature Pills
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: const [
                  FeaturePill(label: 'Upload & summarize'),
                  FeaturePill(label: 'Crossref live trends'),
                  FeaturePill(label: 'Compare papers'),
                  FeaturePill(label: 'Save favorites'),
                ],
              ),
              const SizedBox(height: 60),
              // Illustration or additional content could go here
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ChatScreen()),
          );
        },
        backgroundColor: const Color(0xFF7C4DFF),
        icon: const Icon(Icons.chat_bubble_outline),
        label: const Text('Ask me'),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
