import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Container, Card, List, ListItem, ListItemIcon, ListItemText, Divider, LinearProgress, Chip, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const ResearchGapDetector = () => {
  const [topic, setTopic] = useState('');
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDetectGaps = () => {
    if (!topic) return;
    setLoading(true);
    setGaps([]);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setGaps([
        'Lack of longitudinal studies in remote education impact.',
        'Insufficient data on the long-term effects of AI in primary care.',
        'Limited research on cross-platform accessibility for neurodivergent users.',
        'Unexplored potential of blockchain in small-scale agricultural logistics.'
      ]);
    }, 2500);
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1, flexWrap: "wrap" }}>
              <AutoAwesomeIcon sx={{ color: "#7F56D9", fontSize: { xs: 24, sm: 28 } }} />
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>Research Gap Detector</Typography>
            </Box>
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
                sx={{ bgcolor: "#101828", "&:hover": { bgcolor: "#1D2939" }, px: 4, py: 1.5 }}
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
                        <ListItem sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 4 }, "&:hover": { bgcolor: "#F9FAFB" } }}>
                          <ListItemIcon sx={{ minWidth: { xs: 32, sm: 40 } }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#7F56D9" }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={gap} 
                            primaryTypographyProps={{ fontWeight: 500, color: "#344054", variant: "body2" }}
                          />
                        </ListItem>
                        {index < gaps.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Card>
                <Box sx={{ mt: 4, textAlign: "center" }}>
                  <Button variant="text" sx={{ color: "#667085", fontSize: "0.875rem" }}>Download Gap Report (PDF)</Button>
                </Box>
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
