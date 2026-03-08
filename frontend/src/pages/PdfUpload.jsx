import React, { useState } from 'react';
import { Box, Typography, Button, Paper, LinearProgress } from '@mui/material';

const PdfUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    // Simulate upload and summary generation
    setTimeout(() => {
      setUploading(false);
      setSummary('This is a summary of the uploaded PDF.');
    }, 3000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        PDF upload + summary
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Button
          variant="contained"
          component="label"
        >
          Upload File
          <input
            type="file"
            hidden
            onChange={handleFileChange}
            accept="application/pdf"
          />
        </Button>
        {file && <Typography sx={{ mt: 2 }}>{file.name}</Typography>}
        <Button onClick={handleUpload} sx={{ mt: 2, ml: 2 }} disabled={!file || uploading}>
          {uploading ? 'Summarizing...' : 'Summarize'}
        </Button>
        {uploading && <LinearProgress sx={{ mt: 2 }} />}
        {summary && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Summary</Typography>
            <Typography>{summary}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PdfUpload;