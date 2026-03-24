import React, { useState, useEffect } from "react";
import { Box, Container, Typography, CircularProgress, Card, Chip } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import PaperCard from "../components/PaperCard";
import Searchbar from "../components/Searchbar";
import { fetchRecentPapers, searchPapers, addFavorite } from "../api/papers";
import { getGlobalTrends } from "../api/papers";

const palette = [
  { border: "#7F56D9", fill: "rgba(127,86,217,0.15)" },
  { border: "#12B76A", fill: "rgba(18,183,106,0.15)" },
  { border: "#F79009", fill: "rgba(247,144,9,0.18)" },
  { border: "#EF4444", fill: "rgba(239,68,68,0.18)" },
  { border: "#06AED4", fill: "rgba(6,174,212,0.15)" },
  { border: "#667085", fill: "rgba(102,112,133,0.15)" },
];

const labelMap = {
  "cs.AI": "Artificial Intelligence",
  "cs.LG": "Machine Learning",
  "stat.ML": "Statistical ML",
  "cs.CV": "Computer Vision",
  "cs.CL": "Computational Linguistics",
  "cs.IR": "Information Retrieval",
  "cs.RO": "Robotics",
  "cs.DS": "Data Structures & Algorithms",
};

function Home() {
  const [papers, setPapers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const maxPages = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [trendTop, setTrendTop] = useState([]);
  const [trendSource, setTrendSource] = useState("");
  const [trendError, setTrendError] = useState("");

  useEffect(() => {
    loadInitialPapers();
    loadTrends();
  }, []);

  // Smooth scroll to top on page change to avoid jank
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const loadInitialPapers = async () => {
    setLoading(true);
    try {
      const data = await fetchRecentPapers(page, pageSize);
      setPapers(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching papers:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrends = async () => {
    const fallback = [
      { label: "cs.AI", percent: 26.0, rank: 1, borderColor: palette[0].border, backgroundColor: palette[0].fill },
      { label: "cs.LG", percent: 24.5, rank: 2, borderColor: palette[1].border, backgroundColor: palette[1].fill },
      { label: "stat.ML", percent: 18.5, rank: 3, borderColor: palette[2].border, backgroundColor: palette[2].fill },
      { label: "cs.CV", percent: 17.0, rank: 4, borderColor: palette[3].border, backgroundColor: palette[3].fill },
      { label: "cs.CL", percent: 14.0, rank: 5, borderColor: palette[4].border, backgroundColor: palette[4].fill },
    ];
    try {
      const trend = await getGlobalTrends();
      if (trend?.domains?.length) {
        const paletteSized = trend.domains.map((d, idx) => ({
          ...d,
          borderColor: palette[idx % palette.length].border,
          backgroundColor: palette[idx % palette.length].fill,
        }));
        setTrendTop(paletteSized);
        setTrendSource(trend.source || "unknown");
      } else {
        setTrendTop(fallback);
        setTrendSource("fallback");
        setTrendError("");
      }
    } catch (err) {
      console.error("Error fetching trends:", err);
      setTrendTop(fallback);
      setTrendSource("fallback");
      setTrendError("");
    }
  };

  const totalSum = trendTop.reduce((a, b) => a + (Number.isFinite(b.percent) ? b.percent : 0), 0) || 0;
  const percentTop = trendTop.map((t) => ({
    ...t,
    display: labelMap[t.label] || t.label,
    percent: Number.isFinite(t.percent) ? t.percent : 0,
  }));

  const handleSearch = async () => {
    const isSearch = !!searchQuery.trim();
    if (!isSearch) {
      setPage(1);
      loadInitialPapers();
      return;
    }
    setLoading(true);
    try {
      const data = await searchPapers(searchQuery, page, pageSize);
      setPapers(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error searching papers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    const clamped = Math.max(1, Math.min(newPage, maxPages));
    setPage(clamped);
    const isSearch = !!searchQuery.trim();
    setLoading(true);
    try {
      if (isSearch) {
        const data = await searchPapers(searchQuery, clamped, pageSize);
        setPapers(data.items || []);
        setTotal(data.total || 0);
      } else {
        const data = await fetchRecentPapers(clamped, pageSize);
        setPapers(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Error loading page:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentMaxPage = Math.min(
    maxPages,
    Math.max(1, Math.ceil((total || 0) / pageSize))
  );

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
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, fontSize: { xs: "1.6rem", sm: "2rem" }, color: "#101828" }}>
              {searchQuery ? `Results for "${searchQuery}"` : "Recent Research Papers"}
            </Typography>

            {true && (
              <Card sx={{ p: { xs: 2, sm: 3 }, mb: 4, boxShadow: "0 10px 40px -18px rgba(16,24,40,0.35)" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Global Trending Research Domains (Crossref pulse)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Live share of recent Crossref-indexed AI/ML papers (past 7 days).
                </Typography>
                {trendSource && (
                  <Chip
                    size="small"
                    label={
                      trendSource === "fallback"
                        ? "Showing cached snapshot (offline fallback)"
                        : `Source: ${trendSource}`
                    }
                    sx={{
                      mb: 2,
                      bgcolor: trendSource === "fallback" ? "#FEF3C7" : "#EEF2FF",
                      color: trendSource === "fallback" ? "#92400E" : "#312E81",
                      fontWeight: 600,
                    }}
                  />
                )}
                {percentTop.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "#667085" }}>
                    No trend data yet. Add or fetch papers to see top domains.
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {percentTop.map((t, idx) => (
                      <Box key={t.label} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#101828" }}>
                            {idx + 1}. {t.display}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#475467", fontWeight: 600 }}>
                            {t.percent}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: 10,
                            borderRadius: 999,
                            backgroundColor: "#F2F4F7",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${Math.min(Math.max(t.percent, 0), 100)}%`,
                              background: t.backgroundColor,
                              border: `1px solid ${t.borderColor}`,
                              borderRadius: 999,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            )}
            {trendError && trendTop.length === 0 && (
              <Card sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
                <Typography variant="body2" color="text.secondary">{trendError}</Typography>
              </Card>
            )}

            {/* Paper Cards (Vertical Stack) */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 }, minHeight: 320 }}>
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

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Page {page} of {currentMaxPage}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label="Prev"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || loading}
                  sx={{ backgroundColor: "#EEF2FF", color: "#312E81", fontWeight: 700 }}
                />
                <Chip
                  label="Next"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= currentMaxPage || loading}
                  sx={{ backgroundColor: "#EEF2FF", color: "#312E81", fontWeight: 700 }}
                />
              </Box>
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

