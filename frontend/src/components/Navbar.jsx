import React, { useEffect, useState } from "react";
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
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import { Link, useLocation } from "react-router-dom";
import { isAuthenticated, logout, getStoredUser, fetchMe } from "../api/auth";
import { getHistory } from "../api/papers";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(getStoredUser());
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState({ open: false, severity: "info", message: "" });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated()) {
        if (!user) {
          const me = await fetchMe().catch(() => null);
          if (me) setUser(me);
        }
        const sessions = await getHistory().catch(() => []);
        setHistory(Array.isArray(sessions) ? sessions : []);
        setToast({ open: true, severity: "success", message: "Logged in" });
      }
    };
    init();
  }, []);

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    setUser(null);
    setHistory([]);
    setToast({ open: true, severity: "info", message: "Logged out" });
    handleCloseMenu();
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
          {isAuthenticated() && user ? (
            <>
              <IconButton onClick={handleProfileMenu} sx={{ ml: 1 }}>
                <Avatar sx={{ bgcolor: "#000" }}>
                  {user.full_name ? user.full_name[0].toUpperCase() : "U"}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              >
                <MenuItem disabled>
                  Signed in as {user.full_name || user.email}
                </MenuItem>
                <Divider />
                <MenuItem disabled>
                  <ListItemIcon>
                    <HistoryIcon fontSize="small" />
                  </ListItemIcon>
                  Recent Sessions
                </MenuItem>
                {history.length === 0 && (
                  <MenuItem disabled sx={{ pl: 4 }}>
                    No history yet
                  </MenuItem>
                )}
                {history.slice(0, 5).map((session) => (
                  <MenuItem key={session.id || session.session_name} sx={{ pl: 4 }} disabled>
                    {session.session_name || session}
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
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
          )}
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

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
