import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Container, Card, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import BookmarkIcon from '@mui/icons-material/Bookmark';

const FavoritePapers = () => {
  const [papers, setPapers] = useState([
    'Favorite Paper 1: Advancements in Transformer Models',
    'Favorite Paper 2: Deep Learning in Healthcare',
    'Favorite Paper 3: Quantum Computing Basics',
  ]);

  const handleRemovePaper = (paperToRemove) => {
    setPapers(papers.filter(paper => paper !== paperToRemove));
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <BookmarkIcon sx={{ fontSize: 32, color: "#101828" }} />
              <Typography variant="h4">Favorite Papers</Typography>
            </Box>

            <Card sx={{ p: 0 }}>
              <List sx={{ p: 0 }}>
                {papers.map((paper, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      sx={{
                        py: 2,
                        px: 3,
                        "&:hover": { bgcolor: "#F9FAFB" }
                      }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => handleRemovePaper(paper)}
                          sx={{ color: "#667085", "&:hover": { color: "#D92D20" } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={paper} 
                        primaryTypographyProps={{ 
                          fontWeight: 500,
                          color: "#101828"
                        }}
                      />
                    </ListItem>
                    {index < papers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Card>

            {papers.length === 0 && (
              <Box sx={{ textAlign: "center", mt: 8 }}>
                <Typography color="text.secondary">No favorite papers yet.</Typography>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default FavoritePapers;
