import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button
} from "@mui/material";

import { Link } from "react-router-dom";

const Navbar = () => {

  const navStyle = {
    cursor: "pointer",
    textDecoration: "none",
    color: "inherit",
    fontWeight: 500,
    "&:hover": { color: "#f95700cc" }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "#e5e5e5",
        color: "#000",
        px: 4,
        py: 1,
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            fontWeight: 600,
            textDecoration: "none",
            color: "inherit"
          }}
        >
          Ai Researcher
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: "flex", gap: 4 }}>

          <Typography component={Link} to="/" sx={navStyle}>
            Home
          </Typography>

          <Typography component={Link} to="/PaperComparison" sx={navStyle}>
            Paper Comparison
          </Typography>

          <Typography component={Link} to="/PdfUpload" sx={navStyle}>
            PDF Upload
          </Typography>

          <Typography component={Link} to="/ResearchGapDetector" sx={navStyle}>
            Research Gap
          </Typography>

          <Typography component={Link} to="/RelatedPapers" sx={navStyle}>
            Related Papers
          </Typography>

          <Typography component={Link} to="/FavoritePapers" sx={navStyle}>
            Favorites
          </Typography>

        </Box>

        {/* Login Button */}
        <Button
          component={Link}
          to="/login"
          variant="contained"
          sx={{
            background: "#000",
            borderRadius: "30px",
            px: 3,
            color: "white",
            textTransform: "none",
            "&:hover": {
              background: "#222"
            }
          }}
        >
          Sign Up / Login
        </Button>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;