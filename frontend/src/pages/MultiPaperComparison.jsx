import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper } from '@mui/material';

const MultiPaperComparison = () => {
  const [papers, setPapers] = useState(['', '']);

  const handleAddPaper = () => {
    setPapers([...papers, '']);
  };

  const handlePaperChange = (index, value) => {
    const newPapers = [...papers];
    newPapers[index] = value;
    setPapers(newPapers);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Multi-paper comparison
      </Typography>
      <Grid container spacing={2}>
        {papers.map((paper, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Paper sx={{ p: 2 }}>
              <TextField
                fullWidth
                label={`Paper ${index + 1} URL or DOI`}
                value={paper}
                onChange={(e) => handlePaperChange(index, e.target.value)}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Button onClick={handleAddPaper} sx={{ mt: 2 }}>
        Add another paper
      </Button>
      <Button variant="contained" sx={{ mt: 2, ml: 2 }}>
        Compare
      </Button>
    </Box>
  );
};

export default MultiPaperComparison;