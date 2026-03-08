import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const FavoritePapers = () => {
  const [papers, setPapers] = useState([
    'Favorite Paper 1',
    'Favorite Paper 2',
    'Favorite Paper 3',
  ]);

  const handleRemovePaper = (paperToRemove) => {
    setPapers(papers.filter(paper => paper !== paperToRemove));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Favorite papers
      </Typography>
      <List>
        {papers.map((paper, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePaper(paper)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={paper} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FavoritePapers;