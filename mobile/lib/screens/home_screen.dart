import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/paper_provider.dart';
import '../widgets/paper_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PaperProvider>(context, listen: false).fetchRecentPapers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final paperProvider = Provider.of<PaperProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => paperProvider.fetchRecentPapers(),
          child: CustomScrollView(
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.all(24.0),
                sliver: SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Hi, ${authProvider.user?.fullName.split(' ')[0] ?? 'Explorer'} 👋',
                                style: GoogleFonts.poppins(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                              Text(
                                'Ready for some research today?',
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                          CircleAvatar(
                            backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                            child: Icon(Icons.person_outline, color: Theme.of(context).primaryColor),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                      Text(
                        'Recent Papers',
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
              if (paperProvider.isLoadingRecent)
                const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (paperProvider.error != null)
                SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Failed to load papers', style: GoogleFonts.inter(color: Colors.grey[600])),
                        TextButton(
                          onPressed: () => paperProvider.fetchRecentPapers(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              else if (paperProvider.recentPapers.isEmpty)
                SliverFillRemaining(
                  child: Center(
                    child: Text('No papers found', style: GoogleFonts.inter(color: Colors.grey[600])),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        return PaperCard(paper: paperProvider.recentPapers[index]);
                      },
                      childCount: paperProvider.recentPapers.length,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
