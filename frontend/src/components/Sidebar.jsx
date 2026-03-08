import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";

function Sidebar() {
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const [visible, setVisible] = React.useState(true);

  const sessions = [
    "Machine Learning Trends 2024",
    "Deep Learning in Healthcare",
    "Quantum Computing Basics",
    "NLP for Customer Support",
    "AI Safety Guidelines",
    "Blockchain and Finance",
    "Robotics in Agriculture",
    "Smart Cities Research",
    "Edge Computing Benefits",
    "Graph Neural Networks"
  ];

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
        {sessions.map((session, index) => (
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
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;
