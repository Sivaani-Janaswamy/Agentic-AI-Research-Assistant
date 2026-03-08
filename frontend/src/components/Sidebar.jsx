import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import { getHistory } from "../api/papers";
import { isAuthenticated } from "../api/auth";

function Sidebar() {
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const [visible, setVisible] = React.useState(true);
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

  if (!isDesktop || !visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: "72px", // Matches Navbar height + small buffer
        width: 280,
        height: "calc(100vh - 72px)",
        background: "#F2F4F7", // Light grey as requested
        pt: 2,
        px: 1.5,
        borderRight: "1px solid #EAECF0",
        overflowY: "auto",
        zIndex: (theme) => theme.zIndex.drawer,
        transition: "width 0.3s ease",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, px: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HistoryIcon sx={{ fontSize: 20, color: "#667085" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#344054" }}>
            History
          </Typography>
        </Box>
        <IconButton
          onClick={() => setVisible(false)}
          size="small"
          sx={{
            color: "#667085",
            "&:hover": { background: "#EAECF0" }
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
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
                  backgroundColor: "#EAECF0",
                }
              }}
            >
              <ListItemText
                primary={session}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: 500,
                  color: "#475467",
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

