import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Paper Comparison", path: "/PaperComparison" },
    { label: "PDF Upload", path: "/PdfUpload" },
    { label: "Research Gap", path: "/ResearchGapDetector" },
    { label: "Related Papers", path: "/RelatedPapers" },
    { label: "Favorites", path: "/FavoritePapers" },
  ];

  const navStyle = {
    cursor: "pointer",
    textDecoration: "none",
    color: "inherit",
    fontWeight: 500,
    "&:hover": { color: "#f95700cc" }
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 700 }}>
        Ai Researcher
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <Button
              component={Link}
              to={item.path}
              sx={{ 
                width: '100%', 
                textAlign: 'center', 
                color: location.pathname === item.path ? "#101828" : "#667085",
                fontWeight: location.pathname === item.path ? 700 : 500,
                textTransform: "none",
                py: 1.5
              }}
            >
              {item.label}
            </Button>
          </ListItem>
        ))}
        <ListItem disablePadding sx={{ mt: 2 }}>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            fullWidth
            sx={{
              background: "#000",
              borderRadius: "30px",
              color: "white",
              textTransform: "none",
            }}
          >
            Sign Up / Login
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "#e5e5e5",
          color: "#000",
          px: { xs: 1, md: 4 },
          py: 1,
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Burger Menu for Mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { lg: "none" }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              fontWeight: 600,
              textDecoration: "none",
              color: "inherit",
              flexGrow: { xs: 1, lg: 0 }
            }}
          >
            Ai Researcher
          </Typography>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 4 }}>
            {navItems.map((item) => (
              <Typography 
                key={item.label} 
                component={Link} 
                to={item.path} 
                sx={{
                  ...navStyle,
                  color: location.pathname === item.path ? "#000" : "inherit",
                  fontWeight: location.pathname === item.path ? 700 : 500
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>

          {/* Desktop Login Button */}
          <Button
            component={Link}
            to="/login"
            variant="contained"
            sx={{
              display: { xs: "none", lg: "inline-flex" },
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

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
