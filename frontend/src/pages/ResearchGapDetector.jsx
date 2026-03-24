import React, { useMemo, useState } from 'react';
import { Box, Typography, TextField, Button, Container, Card, List, ListItem, ListItemIcon, ListItemText, Divider, LinearProgress, Chip, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { detectGaps } from "../api/analysis";

const ResearchGapDetector = () => {
  const [topic, setTopic] = useState('');
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDetectGaps = async () => {
    if (!topic) return;
    setLoading(true);
    setGaps([]);
    try {
      const data = await detectGaps(topic);
      setGaps(data.gaps || []);
    } catch (error) {
      console.error("Error detecting gaps:", error);
      alert("Failed to analyze research landscape. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return '#D92D20';
      case 'medium': return '#F79009';
      case 'low': return '#12B76A';
      default: return '#667085';
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
          <Container maxWidth="md">
            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: "1.75rem", sm: "2.125rem" }, color: "#101828", mb: 1 }}>
              Research Gap Detector
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: "#667085", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              Identify unexplored areas and opportunities in your field of study.
            </Typography>

            <Card sx={{ p: { xs: 3, sm: 4 }, mb: 6 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Enter your research topic</Typography>
              <TextField
                fullWidth
                placeholder="e.g., 'Artificial Intelligence in Education'"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                variant="contained"
                onClick={handleDetectGaps}
                disabled={!topic || loading}
                sx={{
                  background: "linear-gradient(90deg, #7F56D9 0%, #9E77ED 100%)",
                  "&:hover": { background: "linear-gradient(90deg, #6B46C1 0%, #7F56D9 100%)" },
                  px: 4,
                  py: 1.5,
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 12px 32px -14px rgba(127,86,217,0.6)"
                }}
                startIcon={<SearchIcon />}
                fullWidth
              >
                {loading ? 'Analyzing Research Landscape...' : 'Detect Research Gaps'}
              </Button>
            </Card>

            {loading && (
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <LinearProgress sx={{ mb: 2, borderRadius: 4, height: 8, bgcolor: "#F2F4F7", "& .MuiLinearProgress-bar": { bgcolor: "#7F56D9" } }} />
                <Typography color="text.secondary" variant="body2">Comparing thousands of publications...</Typography>
              </Box>
            )}

            {gaps.length > 0 && (
              <Box>
                <Card sx={{ p: { xs: 2, sm: 3 }, mb: 4, background: "#0B1021", color: "#E0E7FF" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Insight Heatmap</Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: 1.5
                    }}
                  >
                    {gaps.map((g, idx) => {
                      const level = g.insight_level?.toLowerCase() || "low";
                      const color = level === "high" ? "#D92D20" : level === "medium" ? "#F79009" : "#12B76A";
                      return (
                        <Box
                          key={idx}
                          sx={{
                            borderRadius: 2,
                            p: 1.5,
                            background: `linear-gradient(135deg, ${color}33, ${color}55)`,
                            border: `1px solid ${color}55`,
                            minHeight: 120
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#F8FAFF", mb: 0.5 }}>
                            {g.title || `Gap ${idx + 1}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#E2E8F0" }}>
                            {g.insight_level ? `${g.insight_level} Insight` : "Insight"}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: "#E0E7FF" }}>
                            {g.description}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Card>

                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 3 }}>
                   <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                    Identified Gaps
                  </Typography>
                  <Chip label={`${gaps.length} New Insights`} size="small" sx={{ bgcolor: "#F9F5FF", color: "#7F56D9", fontWeight: 700 }} />
                </Stack>
                
                <Card sx={{ p: 0 }}>
                  <List sx={{ p: 0 }}>
                    {gaps.map((gap, index) => (
                      <React.Fragment key={index}>
                        <ListItem sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 4 }, "&:hover": { bgcolor: "#F9FAFB" }, display: "block" }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#101828" }}>
                              {gap.title}
                            </Typography>
                            <Chip 
                              label={`${gap.insight_level} Insight`} 
                              size="small" 
                              sx={{ 
                                bgcolor: `${getLevelColor(gap.insight_level)}15`, 
                                color: getLevelColor(gap.insight_level),
                                fontWeight: 700,
                                fontSize: "0.7rem"
                              }} 
                            />
                          </Box>
                          <Typography variant="body2" sx={{ color: "#475467", lineHeight: 1.6 }}>
                            {gap.description}
                          </Typography>
                        </ListItem>
                        {index < gaps.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Card>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default ResearchGapDetector;
