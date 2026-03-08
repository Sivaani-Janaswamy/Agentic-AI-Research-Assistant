import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Container, Link as MuiLink, Divider, Stack, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import Navbar from "../components/Navbar";
import { login } from "../api/auth";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F8FAFF" }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: { xs: 4, sm: 8 }, px: { xs: 2, sm: 3 } }}>
        <Paper sx={{ p: { xs: 3, sm: 5 }, width: "100%", textAlign: "center", borderRadius: "16px", boxShadow: "0px 8px 24px rgba(0,0,0,0.05)" }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>Welcome Back</Typography>
          <Typography variant="body2" sx={{ mb: 4, color: "#667085" }}>Log in to your AI Researcher account</Typography>
          
          <Stack spacing={2.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{ py: 1.2, borderColor: "#D0D5DD", color: "#344054", fontWeight: 600 }}
            >
              Sign in with Google
            </Button>

            <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">OR</Typography></Divider>

            <TextField 
              fullWidth 
              label="Email address" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField 
              fullWidth 
              label="Password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />

            <Box sx={{ textAlign: "right" }}>
              <MuiLink component={Link} to="#" sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#101828", textDecoration: "none" }}>
                Forgot password?
              </MuiLink>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              sx={{ py: 1.5, bgcolor: "#101828", "&:hover": { bgcolor: "#1D2939" }, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ mt: 4, color: "#667085" }}>
            Don't have an account?{' '}
            <MuiLink component={Link} to="/signup" sx={{ fontWeight: 600, color: "#101828", textDecoration: "none" }}>
              Sign up
            </MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
