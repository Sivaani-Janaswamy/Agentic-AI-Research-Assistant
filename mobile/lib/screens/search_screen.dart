import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/paper_provider.dart';
import '../widgets/paper_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();

  void _onSearch(String query) {
    if (query.trim().isNotEmpty) {
      Provider.of<PaperProvider>(context, listen: false).searchPapers(query);
    }
  }

  @override
  Widget build(BuildContext context) {
    final paperProvider = Provider.of<PaperProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Search Papers',
                    style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _controller,
                    onSubmitted: _onSearch,
                    decoration: InputDecoration(
                      hintText: 'Search by title, abstract...',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _controller.clear();
                          paperProvider.searchPapers('');
                        },
                      ),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: paperProvider.isLoadingSearch
                  ? const Center(child: CircularProgressIndicator())
                  : paperProvider.searchResults.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.search_off_outlined, size: 64, color: Colors.grey[300]),
                              const SizedBox(height: 16),
                              Text(
                                _controller.text.isEmpty ? 'Search for papers to begin' : 'No results found',
                                style: GoogleFonts.inter(color: Colors.grey[500]),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 24.0),
                          itemCount: paperProvider.searchResults.length,
                          itemBuilder: (context, index) {
                            return PaperCard(paper: paperProvider.searchResults[index]);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
