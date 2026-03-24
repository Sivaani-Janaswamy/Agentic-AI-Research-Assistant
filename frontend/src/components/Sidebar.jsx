import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  CircularProgress
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { getHistory } from "../api/papers";
import { isAuthenticated } from "../api/auth";

function Sidebar() {
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchHistory();
    }
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setSessions(data.map(s => s.session_name));
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isDesktop) return null;

  return (
    <Box
      sx={{
        position: "sticky",
        top: "72px", // Matches Navbar height + small buffer
        width: 280,
        height: "calc(100vh - 72px)",
        maxHeight: "calc(100vh - 72px)",
        background: "linear-gradient(180deg, #F5F3FF 0%, #FFFFFF 60%)",
        pt: 2,
        px: 1.5,
        borderRight: "1px solid #EAECF0",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, px: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HistoryIcon sx={{ fontSize: 20, color: "#7F56D9" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#101828" }}>
            History
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 1, borderColor: "#EAECF0" }} />

      {/* History List */}
      <List sx={{ px: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={20} color="inherit" />
          </Box>
        ) : sessions.length > 0 ? (
          sessions.map((session, index) => (
            <ListItemButton
              key={index}
              sx={{
                borderRadius: "8px",
                mb: 0.5,
                py: 1,
                px: 1.5,
                "&:hover": {
                  backgroundColor: "#EEF2FF",
                }
              }}
            >
              <ListItemText
                primary={session}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: 600,
                  color: "#344054",
                  noWrap: true,
                }}
              />
            </ListItemButton>
          ))
        ) : (
          <Typography variant="caption" sx={{ px: 2, color: "#667085" }}>
            {isAuthenticated() ? "No history yet" : "Login to see history"}
          </Typography>
        )}
      </List>
    </Box>
  );
}

export default Sidebar;

