import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';

const ResearchGapDetector = () => {
  const [topic, setTopic] = useState('');
  const [gaps, setGaps] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDetectGaps = () => {
    if (!topic) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setGaps('Here are the identified research gaps for the topic: ...');
    }, 2000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Research gap detector
      </Typography>
      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Enter a research topic"
          value={topic}
          onChange={(e) => setTopic(e.targe.value)}
        />
        <Button
          variant="contained"
          onClick={handleDetectGaps}
          sx={{ mt: 2 }}
          disabled={!topic || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Detect Gaps'}
        </Button>
        {gaps && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Research Gaps</Typography>
            <Typography>{gaps}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ResearchGapDetector;