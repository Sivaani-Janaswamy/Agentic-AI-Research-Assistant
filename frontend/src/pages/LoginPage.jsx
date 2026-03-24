import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Container,
  Link as MuiLink, Divider, Stack, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import { login, googleAuth, forgotPassword, resetPassword } from "../api/auth";

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (document.getElementById('google-identity')) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'google-identity';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Normal Login
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

  // ✅ Google Auth Setup
  useEffect(() => {
    const initGoogle = async () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) return;
      try {
        await loadGoogleScript();

        /* global google */
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              setLoading(true);
              console.debug('[google] credential received');
              await googleAuth(response.credential);
              navigate('/');
            } catch (err) {
              console.error("[google] auth failed", err);
              alert("Google sign-in failed.");
            } finally {
              setLoading(false);
            }
          }
        });

        // ✅ Render Google Button
        google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          {
            theme: "outline",
            size: "large",
            width: 320,
          }
        );

      } catch (err) {
        console.error("[google] script load failed:", err);
      }
    };

    initGoogle();
  }, [navigate]);

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#F8FAFF"
    }}>
      <Navbar />

      <Container maxWidth="sm" sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, sm: 8 },
        px: { xs: 2, sm: 3 }
      }}>
        <Paper sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          textAlign: "center",
          borderRadius: "16px",
          boxShadow: "0px 8px 24px rgba(0,0,0,0.05)"
        }}>
          <Typography variant="h4" sx={{
            mb: 1,
            fontWeight: 800,
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
            color: "#101828"
          }}>
            Welcome Back
          </Typography>

          <Typography variant="body2" sx={{ mb: 4, color: "#667085" }}>
            Log in to your AI Researcher account
          </Typography>

          <Stack spacing={2.5}>

            {/* ✅ Google Button */}
            <div id="googleSignInDiv"></div>

            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>

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
              <MuiLink
                component="button"
                onClick={() => {
                  setResetOpen(true);
                  setResetEmail(email);
                  setResetMessage('');
                  setResetError('');
                  setResetToken('');
                  setResetNewPassword('');
                }}
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#101828",
                  textDecoration: "none",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  p: 0
                }}
              >
                Forgot password?
              </MuiLink>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              sx={{
                py: 1.5,
                background: "linear-gradient(90deg, #7F56D9 0%, #9E77ED 100%)",
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "0 12px 32px -14px rgba(127,86,217,0.6)",
                "&:hover": { background: "linear-gradient(90deg, #6B46C1 0%, #7F56D9 100%)" }
              }}
            >
              {loading
                ? <CircularProgress size={24} color="inherit" />
                : 'Sign In'}
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ mt: 4, color: "#667085" }}>
            Don't have an account?{' '}
            <MuiLink
              component={Link}
              to="/signup"
              sx={{
                fontWeight: 600,
                color: "#101828",
                textDecoration: "none"
              }}
            >
              Sign up
            </MuiLink>
          </Typography>
        </Paper>
      </Container>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Password reset</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {resetMessage ? <Alert severity="success">{resetMessage}</Alert> : null}
          {resetError ? <Alert severity="error">{resetError}</Alert> : null}
          <TextField
            label="Email address"
            fullWidth
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={async () => {
              setResetError('');
              setResetMessage('');
              setResetLoading(true);
              try {
                console.debug('[reset] sending code', resetEmail);
                await forgotPassword(resetEmail);
                setResetMessage("If that email exists, a reset code was sent. Check your inbox and paste the code here.");
                setTimeout(() => setResetMessage(''), 6000);
              } catch (err) {
                console.error("[reset] send failed", err);
                const status = err?.response?.status;
                const detail = err?.response?.data?.detail || err?.message || "Unknown error";
                if (status === 429) {
                  setResetError("Too many reset requests. Please try again in a few minutes.");
                } else {
                  setResetError(`Could not create reset code: ${detail}`);
                }
              } finally {
                setResetLoading(false);
              }
            }}
            disabled={resetLoading || !resetEmail}
          >
            {resetLoading ? 'Sending…' : 'Send reset code'}
          </Button>
          <TextField
            label="Reset code"
            fullWidth
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
          />
          <TextField
            label="New password"
            fullWidth
            type="password"
            value={resetNewPassword}
            onChange={(e) => setResetNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setResetError('');
              setResetMessage('');
              setResetLoading(true);
              try {
                console.debug('[reset] submitting new password');
                await resetPassword(resetToken, resetNewPassword);
                setResetMessage("Password updated. You can now sign in.");
              } catch (err) {
                console.error("[reset] update failed", err);
                const detail = err?.response?.data?.detail || err?.message || "Unknown error";
                setResetError(`Reset failed: ${detail}`);
              } finally {
                setResetLoading(false);
              }
            }}
            disabled={!resetToken || !resetNewPassword}
          >
            {resetLoading ? 'Updating…' : 'Reset password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
