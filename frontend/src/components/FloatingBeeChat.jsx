import React, { useState } from "react";
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Lottie from "lottie-react";
import beeAnimation from "../assets/bee.json";
import { askQuestion } from "../api/analysis";

const FloatingBeeChat = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await askQuestion(userMsg.content);
      const botMsg = {
        role: "assistant",
        content: res?.answer || res?.detail || "I couldn't find that in the retrieved papers.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const detail = e?.response?.data?.detail || e.message || "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: detail }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            display: "flex",
            alignItems: "center",
            gap: 1,
            zIndex: 2000,
            cursor: "pointer"
          }}
          onClick={() => setOpen(true)}
        >
          <Box sx={{ width: 70, height: 70, borderRadius: "50%", boxShadow: "0 8px 24px -10px rgba(127,86,217,0.6)" }}>
            <Lottie animationData={beeAnimation} loop style={{ width: "100%", height: "100%" }} />
          </Box>
          <Typography variant="body2" sx={{ bgcolor: "#FFFFFF", px: 2, py: 1, borderRadius: 999, boxShadow: "0 8px 20px -12px rgba(16,24,40,0.2)", color: "#101828", fontWeight: 700 }}>
            Ask me
          </Typography>
        </Box>
      )}

      {open && (
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: { xs: "90%", sm: 360 },
            maxHeight: 520,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            zIndex: 2100,
            overflow: "hidden",
            border: "1px solid #EAECF0"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, bgcolor: "#F4F3FF" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 28, height: 28 }}>
                <Lottie animationData={beeAnimation} loop style={{ width: "100%", height: "100%" }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#101828" }}>
                Bee Bot
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, p: 2, overflowY: "auto", bgcolor: "#FFFFFF" }}>
            {messages.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Ask about a paper, concept, or finding. I’ll use your indexed papers to answer.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {messages.map((m, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      background: m.role === "user" ? "#EEF2FF" : "#F9FAFB",
                      borderRadius: 1,
                      px: 1.5,
                      py: 1,
                      border: "1px solid #EAECF0",
                      maxWidth: "90%"
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#475467" }}>
                      {m.role === "user" ? "You" : "Bee Bot"}
                    </Typography>
                      <Typography variant="body2" sx={{ color: "#101828", whiteSpace: "pre-line" }}>{m.content}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

          <Box sx={{ p: 2, borderTop: "1px solid #EAECF0", bgcolor: "#FFFFFF" }}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={loading}
                sx={{
                  background: "linear-gradient(90deg, #7F56D9 0%, #9E77ED 100%)",
                  "&:hover": { background: "linear-gradient(90deg, #6B46C1 0%, #7F56D9 100%)" },
                  borderRadius: "12px",
                  minWidth: 90,
                  textTransform: "none",
                  fontWeight: 700
                }}
              >
                {loading ? <CircularProgress size={18} color="inherit" /> : "Send"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default FloatingBeeChat;
