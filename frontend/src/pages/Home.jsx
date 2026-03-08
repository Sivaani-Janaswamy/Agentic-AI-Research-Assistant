import React, { useState, useEffect } from "react";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import PaperCard from "../components/PaperCard";
import Searchbar from "../components/Searchbar";
import { fetchRecentPapers, searchPapers, addFavorite } from "../api/papers";

function Home() {
  const [papers, setPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialPapers();
  }, []);

  const loadInitialPapers = async () => {
    setLoading(true);
    try {
      const data = await fetchRecentPapers();
      setPapers(data);
    } catch (error) {
      console.error("Error fetching papers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadInitialPapers();
      return;
    }
    setLoading(true);
    try {
      const data = await searchPapers(searchQuery);
      setPapers(data);
    } catch (error) {
      console.error("Error searching papers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaper = async (paper) => {
    try {
      await addFavorite({
        paper_id: paper.id || paper.external_id,
        title: paper.title,
        pdf_url: paper.pdf_url
      });
      alert("Paper saved to favorites!");
    } catch (error) {
      console.error("Error saving paper:", error);
      alert("Failed to save paper. Please make sure you are logged in.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <Navbar />

      <Box sx={{ display: "flex", flex: 1, mt: { xs: "64px", lg: "72px" } }}>
        {/* History Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4, lg: 6 },
            ml: { lg: "280px", xs: 0 },
            background: "#F8FAFF",
            minHeight: "calc(100vh - 72px)"
          }}
        >
          <Container maxWidth="md">
            {/* Search Bar */}
            <Box sx={{ mb: { xs: 4, sm: 6 } }}>
              <Searchbar 
                value={searchQuery} 
                onChange={setSearchQuery} 
                onSearch={handleSearch} 
              />
            </Box>

            {/* Section Heading */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              {searchQuery ? `Results for "${searchQuery}"` : "Recent Research Papers"}
            </Typography>

            {/* Paper Cards (Vertical Stack) */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress color="inherit" />
                </Box>
              ) : papers.length > 0 ? (
                papers.map((paper, index) => (
                  <PaperCard key={paper.id || index} paper={paper} onSave={handleSavePaper} />
                ))
              ) : (
                <Typography variant="body1" sx={{ textAlign: "center", py: 4, color: "#667085" }}>
                  No papers found.
                </Typography>
              )}
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}

export default Home;

