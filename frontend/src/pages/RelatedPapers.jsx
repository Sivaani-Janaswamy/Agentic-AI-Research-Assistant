import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText } from '@mui/material';

const RelatedPapers = () => {
  const [topic, setTopic] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFindPapers = () => {
    if (!topic) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setPapers([
        'Related Paper 1',
        'Related Paper 2',
        'Related Paper 3',
      ]);
    }, 2000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Related papers suggestions
      </Typography>
      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Enter a topic or paper"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleFindPapers}
          sx={{ mt: 2 }}
          disabled={!topic || loading}
        >
          {loading ? 'Finding...' : 'Find Papers'}
        </Button>
        {papers.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Related Papers</Typography>
            <List>
              {papers.map((paper, index) => (
                <ListItem key={index}>
                  <ListItemText primary={paper} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default RelatedPapers;