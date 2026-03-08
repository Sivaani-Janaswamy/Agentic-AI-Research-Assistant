import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Container, Card, Stack, CircularProgress, Checkbox, FormControlLabel
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { comparePapers } from "../api/analysis";
import { getFavorites } from "../api/papers";

const PaperComparison = () => {
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState({});
  const [loadingFavs, setLoadingFavs] = useState(true);

  useEffect(() => {
    fetchFavs();
  }, []);

  const fetchFavs = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data || []);
      const initialSelected = {};
      (data || []).forEach(f => initialSelected[f.paper_id] = false);
      setSelected(initialSelected);
    } catch (e) {
      console.error("Failed to fetch favorites:", e);
    } finally {
      setLoadingFavs(false);
    }
  };

  const handleSelect = (paperId) => {
    setSelected(prev => {
      const newSelected = { ...prev, [paperId]: !prev[paperId] };
      return newSelected;
    });
  };

  const transformData = (papers = []) => {
    if (!papers.length) return [];

    const metrics = [
      { key: 'accuracy', label: 'Accuracy / Performance' },
      { key: 'speed', label: 'Inference / Speed' },
      { key: 'dataset', label: 'Dataset Used' },
      { key: 'hardware', label: 'Hardware Requirements' },
    ];

    return metrics.map(m => ({
      metric: m.label,
      ...papers.reduce((acc, p, idx) => {
        acc[`paper${idx + 1}`] = p[m.key] || 'N/A';
        return acc;
      }, {})
    }));
  };

  const handleCompare = async () => {
    const selectedIds = Object.keys(selected).filter(id => selected[id]);
    if (selectedIds.length < 2 || selectedIds.length > 3) {
      alert("Please select 2-3 papers to compare.");
      return;
    }

    setComparing(true);
    try {
      const data = await comparePapers(selectedIds);
      const papersArray = data?.papers || [];
      if (!papersArray.length) {
        alert("No papers returned from comparison API.");
        setComparing(false);
        return;
      }
      const transformed = transformData(papersArray);
      setResults({ papers: papersArray, matrix: transformed });
    } catch (error) {
      console.error("Comparison error:", error);
      alert("Failed to generate comparison matrix.");
    } finally {
      setComparing(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Box sx={{ display: "flex", flex: 1, mt: { xs: "64px", lg: "72px" } }}>
        <Sidebar />
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
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1, flexWrap: "wrap" }}>
              <CompareArrowsIcon sx={{ color: "#101828", fontSize: { xs: 24, sm: 28 } }} />
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                Paper Comparison
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 4, color: "#667085", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              Select papers to compare across key metrics and methodologies.
            </Typography>

            <Card sx={{ p: { xs: 3, sm: 4 }, mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                {loadingFavs ? "Loading your library..." : `You have ${favorites.length} papers in your library.`}
              </Typography>
              <Stack direction="column" spacing={1} sx={{ mb: 3 }}>
                {favorites.map(f => (
                  <FormControlLabel
                    key={f.paper_id}
                    control={<Checkbox checked={selected[f.paper_id] || false} onChange={() => handleSelect(f.paper_id)} />}
                    label={f.title}
                  />
                ))}
              </Stack>
              <Button
                variant="contained"
                onClick={handleCompare}
                disabled={comparing || loadingFavs}
                sx={{
                  bgcolor: "#101828",
                  "&:hover": { bgcolor: "#1D2939" },
                  px: { xs: 3, sm: 6 },
                  py: 1.5,
                  borderRadius: "30px",
                  fontSize: { xs: "0.875rem", sm: "1rem" }
                }}
              >
                {comparing ? <CircularProgress size={24} color="inherit" /> : 'Start Comparison Matrix'}
              </Button>
            </Card>

            {results && results.matrix.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                  Comparison Matrix
                </Typography>
                <TableContainer component={Card} sx={{ boxShadow: "none", border: "1px solid #EAECF0", overflowX: "auto" }}>
                  <Table sx={{ minWidth: { xs: 800, lg: "100%" } }}>
                    <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: "#475467", py: 2 }}>Metric</TableCell>
                        {results.papers.map((p, idx) => (
                          <TableCell key={p.id} sx={{ fontWeight: 700, color: "#101828", py: 2 }}>
                            {p.title}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.matrix.map((row, index) => (
                        <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: "#475467", bgcolor: "#F9FAFB", py: 2 }}>
                            {row.metric}
                          </TableCell>
                          {results.papers.map((_, idx) => (
                            <TableCell key={idx} sx={{ color: "#101828", py: 2 }}>{row[`paper${idx + 1}`]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                  sx={{ mt: 4 }}
                >
                  <Typography variant="caption" color="text.secondary">Generated by AI Researcher</Typography>
                  <Button variant="outlined" sx={{ borderColor: "#D0D5DD", color: "#344054", width: { xs: "100%", sm: "auto" } }}>
                    Export to Excel
                  </Button>
                </Stack>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default PaperComparison;