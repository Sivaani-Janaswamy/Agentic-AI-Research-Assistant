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

  const sessions = ["Session", "Session", "Session"];

  if (!isDesktop || !visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: "64px",
        width: 300,
        height: "calc(100vh - 64px)",
        background: "##F8FAFF",
        pt: 3,
        px: 1,
        borderRight: "1px solid #cfcfcf"
      }}
    >

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        <Typography variant="h7" sx={{ fontWeight: 600 }}>
          Session History
        </Typography>

        <IconButton
          onClick={() => setVisible(false)}
          sx={{
            color: "black",
            width: 28,
            height: 28,
            "&:hover": { background: "#cdcdcd" }
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>

      </Box>

      <Divider sx={{ my: 1, borderBottomWidth: 2 }} />

      {/* Sessions */}
      <List>
        {sessions.map((session, index) => (
          <ListItemButton key={index}>
            <ListItemText primary={session} />
          </ListItemButton>
        ))}
      </List>

    </Box>
  );
}

export default Sidebar;