import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText, Container, Card, Divider, InputAdornment, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { getRelatedPapers } from "../api/papers";

const RelatedPapers = () => {
  const [topic, setTopic] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFindPapers = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const data = await getRelatedPapers(topic);
      setPapers(data.related_papers || []);
    } catch (error) {
      console.error("Error fetching related papers:", error);
      alert("Failed to find related papers.");
    } finally {
      setLoading(false);
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
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
              Related Papers Suggestions
            </Typography>

            <Card sx={{ p: { xs: 3, sm: 4 }, mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>Search by Topic or Paper Title</Typography>
              <TextField
                fullWidth
                placeholder="Enter a research area (e.g., 'Quantum Computing')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#667085" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#F9FAFB",
                    "&:hover fieldset": { borderColor: "#101828" },
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleFindPapers}
                sx={{ 
                  mt: 3, 
                  bgcolor: "#101828", 
                  color: "#fff",
                  px: 4,
                  py: 1.5,
                  "&:hover": { bgcolor: "#1D2939" }
                }}
                disabled={!topic || loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Find Related Papers'}
              </Button>
            </Card>

            {papers.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>Recommended Papers</Typography>
                <Card sx={{ p: 0 }}>
                  <List sx={{ p: 0 }}>
                    {papers.map((paper, index) => (
                      <React.Fragment key={paper.id || index}>
                        <ListItem
                          sx={{
                            py: 2,
                            px: { xs: 2, sm: 3 },
                            "&:hover": { bgcolor: "#F9FAFB" },
                            cursor: "pointer"
                          }}
                          onClick={() => paper.pdf_url && window.open(paper.pdf_url, '_blank')}
                        >
                          <ListItemText 
                            primary={paper.title} 
                            primaryTypographyProps={{ 
                              fontWeight: 500,
                              color: "#101828",
                              variant: "body1"
                            }}
                            secondary={paper.authors || "Research Paper"}
                          />
                        </ListItem>
                        {index < papers.length - 1 && <Divider />}
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

export default RelatedPapers;
