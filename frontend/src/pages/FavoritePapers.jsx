import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Container, Card, Divider, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { getFavorites, removeFavorite } from "../api/papers";

const FavoritePapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setPapers(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePaper = async (paperId) => {
    try {
      await removeFavorite(paperId);
      setPapers(papers.filter(paper => paper.paper_id !== paperId));
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove from favorites.");
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
              <BookmarkIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: "#101828" }} />
              <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>Favorite Papers</Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress color="inherit" />
              </Box>
            ) : (
              <Card sx={{ p: 0 }}>
                <List sx={{ p: 0 }}>
                  {papers.map((paper, index) => (
                    <React.Fragment key={paper.id || index}>
                      <ListItem
                        sx={{
                          py: 2,
                          px: { xs: 2, sm: 3 },
                          "&:hover": { bgcolor: "#F9FAFB" }
                        }}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            aria-label="delete" 
                            onClick={() => handleRemovePaper(paper.paper_id)}
                            sx={{ color: "#667085", "&:hover": { color: "#D92D20" } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText 
                          primary={paper.title} 
                          primaryTypographyProps={{ 
                            fontWeight: 500,
                            color: "#101828",
                            variant: "body1",
                            sx: { pr: 4, cursor: "pointer" }
                          }}
                          onClick={() => paper.pdf_url && window.open(paper.pdf_url, '_blank')}
                        />
                      </ListItem>
                      {index < papers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {papers.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography color="text.secondary">No favorite papers yet.</Typography>
                  </Box>
                )}
              </Card>
            )}
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default FavoritePapers;
