import React, { useState } from 'react';
import { Box, Typography, Button, Card, LinearProgress, Container, Divider, Stack, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { summarizePdf } from "../api/analysis";

const PdfUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const data = await summarizePdf(file);
      setResult(data);
    } catch (error) {
      console.error("Error uploading/summarizing:", error);
      alert("Failed to process PDF. Please try again.");
    } finally {
      setUploading(false);
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

            {result && (
              <Card sx={{ p: { xs: 3, sm: 4 }, mt: 4 }}>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>{result.title}</Typography>
                <Typography variant="subtitle2" sx={{ mb: 3, color: "#667085" }}>Authors: {result.authors?.join(", ") || "Unknown"}</Typography>
                
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, fontSize: "1.1rem" }}>Summary</Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: "#344054", mb: 3 }}>
                  {result.summary}
                </Typography>

                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, fontSize: "1.1rem" }}>Methodology</Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: "#475467", mb: 3 }}>
                  {result.methodology}
                </Typography>

                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, fontSize: "1.1rem" }}>Key Findings</Typography>
                <List>
                  {result.key_findings?.map((finding, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: "#12B76A" }} />
                      </ListItemIcon>
                      <ListItemText primary={finding} primaryTypographyProps={{ variant: "body2", color: "#344054" }} />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 4, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                  <Button size="small" variant="text" sx={{ color: "#475467" }} onClick={() => navigator.clipboard.writeText(result.summary)}>Copy Summary</Button>
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
