import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Container, Card, Divider, Chip, Stack } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const PaperComparison = () => {
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState(null);

  const handleCompare = () => {
    setComparing(true);
    // Simulate comparison logic
    setTimeout(() => {
      setComparing(false);
      setResults([
        { metric: 'Core Methodology', paper1: 'Transformer-based', paper2: 'CNN-based', paper3: 'Hybrid' },
        { metric: 'Accuracy (Top-1)', paper1: '94.2%', paper2: '91.8%', paper3: '95.1%' },
        { metric: 'Inference Speed', paper1: 'Fast', paper2: 'Very Fast', paper3: 'Medium' },
        { metric: 'Dataset Size', paper1: '1.2B tokens', paper2: '800M tokens', paper3: '2.5B tokens' },
        { metric: 'Hardware Requirements', paper1: 'V100 GPU', paper2: 'P100 GPU', paper3: 'A100 GPU' },
      ]);
    }, 2000);
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
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>Paper Comparison</Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 4, color: "#667085", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              Compare multiple research papers across key metrics and methodologies.
            </Typography>

            <Card sx={{ p: { xs: 3, sm: 4 }, mb: 6, textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>Ready to compare your selected papers?</Typography>
              <Typography variant="body2" sx={{ mb: 4, color: "#667085" }}>You have selected 3 papers from your library.</Typography>
              <Button
                variant="contained"
                onClick={handleCompare}
                disabled={comparing}
                sx={{ 
                  bgcolor: "#101828", 
                  "&:hover": { bgcolor: "#1D2939" }, 
                  px: { xs: 3, sm: 6 }, 
                  py: 1.5,
                  borderRadius: "30px",
                  fontSize: { xs: "0.875rem", sm: "1rem" }
                }}
              >
                {comparing ? 'Generating Comparison...' : 'Start Comparison Matrix'}
              </Button>
            </Card>

            {results && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>Comparison Matrix</Typography>
                <TableContainer component={Card} sx={{ boxShadow: "none", border: "1px solid #EAECF0", overflowX: "auto" }}>
                  <Table sx={{ minWidth: { xs: 800, lg: "100%" } }}>
                    <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: "#475467", py: 2 }}>Metric</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#101828", py: 2 }}>Paper A (Primary)</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#101828", py: 2 }}>Paper B</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#101828", py: 2 }}>Paper C</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.map((row, index) => (
                        <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: "#475467", bgcolor: "#F9FAFB", py: 2 }}>
                            {row.metric}
                          </TableCell>
                          <TableCell sx={{ color: "#101828", py: 2 }}>{row.paper1}</TableCell>
                          <TableCell sx={{ color: "#101828", py: 2 }}>{row.paper2}</TableCell>
                          <TableCell sx={{ color: "#101828", py: 2 }}>{row.paper3}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mt: 4 }}>
                  <Typography variant="caption" color="text.secondary">Generated by AI Researcher • Mar 2024</Typography>
                  <Button variant="outlined" sx={{ borderColor: "#D0D5DD", color: "#344054", width: { xs: "100%", sm: "auto" } }}>Export to Excel</Button>
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
