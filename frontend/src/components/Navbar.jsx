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
    { label: "Home", path: "/home" },
    { label: "Compare", path: "/PaperComparison" },
    { label: "Upload", path: "/PdfUpload" },
    { label: "Gap Finder", path: "/ResearchGapDetector" },
    { label: "Related", path: "/RelatedPapers" },
    { label: "Favorites", path: "/FavoritePapers" },
  ];

  const navStyle = {
    cursor: "pointer",
    textDecoration: "none",
    color: "#475467",
    fontWeight: 600,
    "&:hover": { color: "#101828" }
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 700 }}>
        BeeResearch
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
            to="/signup"
            variant="contained"
            fullWidth
            sx={{
              background: "#7F56D9",
              borderRadius: "30px",
              color: "white",
              textTransform: "none",
              fontWeight: 700
            }}
          >
            Sign up
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
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #EAECF0",
          color: "#101828",
          px: { xs: 1.5, md: 4 },
          py: 0.5,
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
              fontWeight: 800,
              textDecoration: "none",
              color: "#101828",
              flexGrow: { xs: 1, lg: 0 },
              letterSpacing: -0.2
            }}
          >
            BeeResearch
          </Typography>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 3 }}>
            {navItems.map((item) => (
              <Typography 
                key={item.label} 
                component={Link} 
                to={item.path} 
                sx={{
                  ...navStyle,
                  color: location.pathname === item.path ? "#101828" : "#475467",
                  fontWeight: location.pathname === item.path ? 800 : 600
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
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                sx={{
                  color: "#475467",
                  textTransform: "none",
                  fontWeight: 600
                }}
              >
                Log in
              </Button>
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                sx={{
                  background: "#7F56D9",
                  borderRadius: "999px",
                  color: "white",
                  textTransform: "none",
                  px: 2.5,
                  py: 0.8,
                  fontWeight: 700,
                  boxShadow: "0 10px 30px -12px rgba(127,86,217,0.6)",
                  "&:hover": { background: "#6B46C1" }
                }}
              >
                Sign up
              </Button>
            </Box>
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
