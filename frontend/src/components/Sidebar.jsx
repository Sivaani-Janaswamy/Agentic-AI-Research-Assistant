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

function Sidebar() {

  const isDesktop = useMediaQuery("(min-width:1024px)");
  const [visible, setVisible] = React.useState(true);

  const sessions = ["Session 1", "Session 2", "Session 3", "Session 4", "Session 5", "Session 6", "Session 7", "Session 8", "Session 9", "Session 10"]; // Added more for scrollable test

  if (!isDesktop || !visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: "64px", // AppBar height, adjust if Navbar height changes
        width: 280, // Slightly reduced width for a cleaner look
        height: "calc(100vh - 64px)",
        background: '#f8f8f8', // Light grey history panel background
        pt: 3,
        px: 1,
        borderRight: "1px solid #e0e0e0", // Softer border
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.03)', // Very soft shadow
        borderRadius: '0 10px 10px 0', // Rounded corners on the right side
        overflowY: 'auto', // Enable vertical scrolling
        zIndex: (theme) => theme.zIndex.drawer // Ensure it's above other content but below Navbar
      }}
    >

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, px: 1 }}>
        
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
          Session History
        </Typography>

        {/* Close button for potential future use or consistency, keeping visible state */}
        <IconButton
          onClick={() => setVisible(false)}
          sx={{
            color: "#666",
            width: 28,
            height: 28,
            "&:hover": { background: "#eee", color: '#000' } // Softer hover
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>

      </Box>

      <Divider sx={{ my: 1, borderBottomWidth: 1, borderColor: '#eee' }} />

      {/* Sessions */}
      <List>
        {sessions.map((session, index) => (
          <ListItemButton
            key={index}
            sx={{
              borderRadius: '8px', // Rounded corners for list items
              mb: 0.5, // Spacing between items
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', // Soft hover state
              }
            }}
          >
            <ListItemText primary={session} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
          </ListItemButton>
        ))}
      </List>

    </Box>
  );
}

export default Sidebar;