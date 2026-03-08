import React, { useState } from 'react';
import { Box, Typography, Button, Card, LinearProgress, Container, Divider, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

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
    setSummary('');
    // Simulate upload and summary generation
    setTimeout(() => {
      setUploading(false);
      setSummary('This research paper discusses the integration of artificial intelligence in modern cybersecurity frameworks. It highlights how machine learning algorithms can predict and neutralize threats in real-time, significantly reducing the response time compared to traditional manual monitoring systems.');
    }, 3000);
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
              PDF Upload & AI Summary
            </Typography>

            <Card sx={{ p: { xs: 3, sm: 6 }, mb: 4, textAlign: "center", border: "2px dashed #EAECF0", bgcolor: "#F9FAFB", boxShadow: "none" }}>
              <Box sx={{ mb: 3 }}>
                <CloudUploadIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: "#667085" }} />
              </Box>
              <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>Choose a PDF file to analyze</Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "#667085" }}>Maximum file size: 25MB</Typography>
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ width: { xs: "100%", sm: "auto" }, borderColor: "#D0D5DD", color: "#344054", bgcolor: "#fff", "&:hover": { bgcolor: "#F9FAFB" } }}
                >
                  Browse File
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept="application/pdf"
                  />
                </Button>
                {file && (
                  <Button 
                    variant="contained" 
                    onClick={handleUpload} 
                    disabled={uploading}
                    fullWidth={false}
                    sx={{ width: { xs: "100%", sm: "auto" }, bgcolor: "#101828", "&:hover": { bgcolor: "#1D2939" } }}
                  >
                    {uploading ? 'Processing...' : 'Generate Summary'}
                  </Button>
                )}
              </Stack>

              {file && (
                <Box sx={{ mt: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <PictureAsPdfIcon sx={{ color: "#D92D20" }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: "break-all" }}>{file.name}</Typography>
                </Box>
              )}
            </Card>

            {uploading && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" sx={{ mb: 1, color: "#667085", textAlign: "center" }}>
                  Analyzing paper content with AI...
                </Typography>
                <LinearProgress sx={{ height: 8, borderRadius: 4, bgcolor: "#F2F4F7", "& .MuiLinearProgress-bar": { bgcolor: "#101828" } }} />
              </Box>
            )}

            {summary && (
              <Card sx={{ p: { xs: 3, sm: 4 }, mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>AI Generated Summary</Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: "#344054" }}>
                  {summary}
                </Typography>
                <Box sx={{ mt: 4, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                  <Button size="small" variant="text" sx={{ color: "#475467" }}>Copy to Clipboard</Button>
                  <Button size="small" variant="text" sx={{ color: "#475467" }}>Save to Library</Button>
                </Box>
              </Card>
            )}
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default PdfUpload;
