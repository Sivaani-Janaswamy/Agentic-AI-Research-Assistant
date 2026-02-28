import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import IconImage from "../assets/icon.png";
import {
  Box,
  Typography,
  Button,
  Divider,
  Stack,
  Card,
  CardContent,
  TextField,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Dashboard({
  query,
  setQuery,
  papers = [],
  gaps = "",
  question,
  setQuestion,
  answer,
  loading,
  runResearch,
  askQuestion,
}) {
  const [history, setHistory] = useState([]);

  // Add search to history
  const addToHistory = (q) => {
    if (q && !history.includes(q)) setHistory([q, ...history]);
  };

  const handleExportPDF = async (paper) => {
    const doc = new jsPDF();
    const content = `
${paper.title || "Untitled Paper"}

Summary:
${paper.summary_text || "No summary available."}

${paper.extracted ? `Dataset / Code Info:\n${paper.extracted}` : ""}
`;
    doc.setFontSize(14);
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 20);
    doc.save(`${paper.title || "paper"}.pdf`);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#000" }}>
      {/* ================= SIDEBAR ================= */}
      <Box
        sx={{
          width: 300,
          p: 5,
          borderRight: "1px solid #222",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Sidebar Header */}
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <img
              src={IconImage}
              alt="icon"
              style={{ width: "30px", height: "30px" }}
            />
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: "#fff", fontSize: "1.6rem" }}
            >
              AI Researcher
            </Typography>
          </Box>
          <Typography variant="body2" color="#aaa" mb={4}>
            Multi-Agent Research Assistant
          </Typography>
          <Divider sx={{ borderColor: "#222", mb: 4 }} />

          {/* ================= SEARCH HISTORY ================= */}
          <Typography variant="subtitle2" sx={{ color: "#a4c639", mb: 1 }}>
            Session History
          </Typography>
          <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
            {history.length === 0 && (
              <Typography variant="body2" color="#888">
                No history yet
              </Typography>
            )}
            {history.map((item, idx) => (
              <Card
                key={idx}
                sx={{
                  bgcolor: "#111",
                  borderRadius: "12px",
                  p: 1,
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#1a1a1a" },
                }}
                onClick={() => {
                  setQuery(item);
                  runResearch();
                }}
              >
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  {item}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        <Typography variant="caption" color="#888">
          © 2026 Sivaani Janaswamy
        </Typography>
      </Box>

      {/* ================= MAIN CONTENT ================= */}
      <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 4, md: 10 }, py: 6 }}>
        <Box maxWidth="1000px" mx="auto">
          {/* Header */}
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#fff", mb: 1 }}
          >
            Explore Research
          </Typography>
          <Typography variant="body1" sx={{ color: "#ccc", mb: 6, lineHeight: 1.6 }}>
            Retrieve relevant papers, extract datasets/code, analyze research gaps, and ask follow-up questions.
          </Typography>

          {/* Search Section */}
          <Card sx={{ mb: 6, bgcolor: "#111", borderRadius: "20px", p: 4 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <TextField
                fullWidth
                label="Enter Research Topic"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{
                  input: { color: "#fff" },
                  label: { color: "#888" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#333" },
                    "&:hover fieldset": { borderColor: "#a4c639" },
                    "&.Mui-focused fieldset": { borderColor: "#a4c639" },
                  },
                }}
              />
              <Box sx={{ display: "inline-block" }}>
                <Button
                  onClick={() => {
                    runResearch();
                    addToHistory(query);
                  }}
                >
                  Search
                </Button>
              </Box>
            </Stack>
          </Card>

          {/* Loading */}
          {loading && (
            <Box display="flex" justifyContent="center" my={6}>
              <CircularProgress sx={{ color: "#a4c639" }} />
            </Box>
          )}

          {/* Papers Section */}
          {papers.map((paper, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card
                sx={{
                  mb: 5,
                  bgcolor: "#111",
                  borderRadius: "20px",
                  p: 4,
                  boxShadow: "0 6px 25px rgba(0,0,0,0.4)",
                  transition: "transform 0.3s ease",
                  position: "relative",
                  "&:hover": { transform: "translateY(-5px)" },
                }}
              >
                {/* Paper title */}
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#fff", mb: 2 }}>
                  {paper.title || "Untitled Paper"}
                </Typography>

                {/* Export PDF button */}
                <Button
                  onClick={() => handleExportPDF(paper)}
                  sx={{
                    borderRadius: "16px",
                    backgroundColor: "#a4c639",
                    color: "#000",
                    padding: "6px 16px",
                    fontSize: "0.9rem",
                    mb: 2,
                    "&:hover": { backgroundColor: "#95b12c" },
                  }}
                >
                  Export PDF
                </Button>

                {/* Paper summary */}
                <Box mt={1}>
                  <ReactMarkdown
                    children={paper.summary_text || "No summary available."}
                    components={{
                      p: ({ node, ...props }) => (
                        <Typography sx={{ color: "#ccc", lineHeight: 1.7 }} {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li style={{ marginBottom: "8px", color: "#ccc" }} {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong style={{ color: "#a4c639" }} {...props} />
                      ),
                    }}
                  />
                </Box>

                {/* Dataset / Code section */}
                {paper.extracted && (
                  <Box mt={3}>
                    <Divider sx={{ borderColor: "#222", mb: 2 }} />
                    <Typography variant="subtitle2" color="#a4c639" gutterBottom>
                      Dataset / Code Info
                    </Typography>
                    <ReactMarkdown
                      children={paper.extracted}
                      components={{
                        p: ({ node, ...props }) => (
                          <Typography sx={{ color: "#ccc", lineHeight: 1.7 }} {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li style={{ marginBottom: "8px", color: "#ccc" }} {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong style={{ color: "#a4c639" }} {...props} />
                        ),
                      }}
                    />
                  </Box>
                )}
              </Card>
            </motion.div>
          ))}

          {/* Research Gaps */}
          {gaps && (
            <Card sx={{ mb: 6, bgcolor: "#111", borderRadius: "20px", p: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: "#fff", mb: 2 }}>
                Research Gap Analysis
              </Typography>
              <ReactMarkdown
                children={gaps}
                components={{
                  p: ({ node, ...props }) => (
                    <Typography sx={{ color: "#ccc", lineHeight: 1.7 }} {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li style={{ marginBottom: "8px", color: "#ccc" }} {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong style={{ color: "#a4c639" }} {...props} />
                  ),
                }}
              />
            </Card>
          )}

          {/* Follow-up Question */}
          {papers.length > 0 && (
            <Card sx={{ bgcolor: "#111", borderRadius: "20px", p: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: "#fff" }}>
                Ask Follow-up Question
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} mt={3}>
                <TextField
                  fullWidth
                  label="Ask about the papers"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  sx={{
                    input: { color: "#fff" },
                    label: { color: "#888" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#333" },
                      "&:hover fieldset": { borderColor: "#a4c639" },
                      "&.Mui-focused fieldset": { borderColor: "#a4c639" },
                    },
                  }}
                />
                <Box sx={{ display: "inline-block" }}>
                  <Button onClick={askQuestion}>Ask</Button>
                </Box>
              </Stack>
              {answer && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Divider sx={{ my: 3, borderColor: "#222" }} />
                  <Typography
                    variant="body2"
                    sx={{ color: "#ccc", whiteSpace: "pre-line", lineHeight: 1.7 }}
                  >
                    {answer}
                  </Typography>
                </motion.div>
              )}
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;