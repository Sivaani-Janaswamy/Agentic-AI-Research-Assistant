import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Container, Card, List, ListItem, ListItemIcon, ListItemText, Divider, LinearProgress, Chip } from '@mui/material';
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
      <Box sx={{ display: "flex", flex: 1, mt: "72px" }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4, lg: 6 },
            ml: { lg: "280px", xs: 0 },
            background: "#F8FAFF",
            minHeight: "calc(100vh - 72px)"
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <AutoAwesomeIcon sx={{ color: "#7F56D9" }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Research Gap Detector</Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 4, color: "#667085" }}>
              Identify unexplored areas and opportunities in your field of study.
            </Typography>

            <Card sx={{ p: 4, mb: 6 }}>
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
                sx={{ bgcolor: "#101828", "&:hover": { bgcolor: "#1D2939" }, px: 4, py: 1.2 }}
                startIcon={<SearchIcon />}
                fullWidth
              >
                {loading ? 'Analyzing Research Landscape...' : 'Detect Research Gaps'}
              </Button>
            </Card>

            {loading && (
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <LinearProgress sx={{ mb: 2, borderRadius: 4, height: 8, bgcolor: "#F2F4F7", "& .MuiLinearProgress-bar": { bgcolor: "#7F56D9" } }} />
                <Typography color="text.secondary">Comparing thousands of publications...</Typography>
              </Box>
            )}

            {gaps.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                  Identified Gaps <Chip label={`${gaps.length} New Insights`} size="small" sx={{ bgcolor: "#F9F5FF", color: "#7F56D9", fontWeight: 700 }} />
                </Typography>
                <Card sx={{ p: 0 }}>
                  <List sx={{ p: 0 }}>
                    {gaps.map((gap, index) => (
                      <React.Fragment key={index}>
                        <ListItem sx={{ py: 3, px: 4, "&:hover": { bgcolor: "#F9FAFB" } }}>
                          <ListItemIcon>
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#7F56D9" }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={gap} 
                            primaryTypographyProps={{ fontWeight: 500, color: "#344054" }}
                          />
                        </ListItem>
                        {index < gaps.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Card>
                <Box sx={{ mt: 4, textAlign: "center" }}>
                  <Button variant="text" sx={{ color: "#667085" }}>Download Gap Report (PDF)</Button>
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
