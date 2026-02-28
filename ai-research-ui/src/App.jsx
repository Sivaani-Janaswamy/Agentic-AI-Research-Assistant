import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Typography, Button, Box } from "@mui/material";
import Dashboard from "./components/Dashboard";
import ShaderBackground from "./components/ShaderBackground";
const API = import.meta.env.VITE_API_URL;

function App() {
  const [view, setView] = useState("landing");
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState([]);
  const [gaps, setGaps] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "AI Research Assistant";
  }, []);

  const runResearch = async () => {
    if (!query) return;
    setLoading(true);
    setPapers([]);
    setGaps("");
    setAnswer("");
    try {
      const res = await axios.post("${API}/research", { query });
      setPapers(res.data.papers);
      setGaps(res.data.gaps);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const askQuestion = async () => {
    if (!question) return;
    try {
      const res = await axios.post(`${API}/ask`, { question });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {view === "landing" ? (
        <Box
          sx={{
            height: "100vh",
            width: "100vw",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            textAlign: "center",
            px: 4,
          }}
        >
          {/* Background Shader */}
          <ShaderBackground />

          {/* Landing Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ zIndex: 1, maxWidth: "800px" }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: "Franklin Gothic Medium, 'Arial Narrow Bold', Arial, sans-serif",
                fontWeight: 700,
                color: "#ffffff",
                fontSize: { xs: "3.5rem", md: "4rem" },
                mb: 5,
              }}
            >
              AI Researcher
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontFamily: "Fira Sans, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                fontWeight: 400,
                color: "#ffffff",
                fontSize: { xs: "1rem", md: "1.2rem" },
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Discover the latest research papers across AI and related fields. Analyze research gaps with intelligent insights. Ask follow-up questions and get concise, actionable answers. Stay ahead in your field by exploring trends, summarizing findings, and turning complex information into knowledge that empowers your projects and ideas.
            </Typography>

            {/* Gradient Border Button */}
            <Box
              sx={{
                display: "inline-block",
                borderRadius: "999px", // pill shape
                background: "linear-gradient(45deg, #a4c639, #000)", // gradient border
                padding: "4px", // border thickness
              }}
            >
              <Button
                variant="contained"
                onClick={() => setView("dashboard")}
                sx={{
                  borderRadius: "999px", // pill shape inside
                  backgroundColor: "transparent", // inside transparent
                  color: "#ffffff",
                  minWidth: 180,
                  fontSize: "1rem",
                  fontWeight: 500,
                  padding: "10px 24px",
                  boxShadow: "none",
                }}
              >
                Get Started
              </Button>
            </Box>
          </motion.div>
        </Box>
      ) : (
        <Dashboard
          query={query}
          setQuery={setQuery}
          papers={papers}
          gaps={gaps}
          question={question}
          setQuestion={setQuestion}
          answer={answer}
          loading={loading}
          runResearch={runResearch}
          askQuestion={askQuestion}
        />
      )}
    </>
  );
}

export default App;