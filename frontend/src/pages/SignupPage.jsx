import React from 'react';
import { Box, Typography, TextField, Button, Paper, Container, Link as MuiLink, Divider, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import Navbar from "../components/Navbar";

const SignupPage = () => {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F8FAFF" }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: { xs: 4, sm: 8 }, px: { xs: 2, sm: 3 } }}>
        <Paper sx={{ p: { xs: 3, sm: 5 }, width: "100%", textAlign: "center", borderRadius: "16px", boxShadow: "0px 8px 24px rgba(0,0,0,0.05)" }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>Create an account</Typography>
          <Typography variant="body2" sx={{ mb: 4, color: "#667085" }}>Join thousands of researchers worldwide</Typography>
          
          <Stack spacing={2.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{ py: 1.2, borderColor: "#D0D5DD", color: "#344054", fontWeight: 600 }}
            >
              Sign up with Google
            </Button>

            <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">OR</Typography></Divider>

            <TextField fullWidth label="Full Name" placeholder="Jane Doe" />
            <TextField fullWidth label="Email address" placeholder="name@company.com" />
            <TextField fullWidth label="Password" type="password" />

            <Typography variant="caption" sx={{ color: "#667085", textAlign: "left" }}>
              By signing up, you agree to our{' '}
              <MuiLink href="#" sx={{ color: "#101828", fontWeight: 600, textDecoration: "none" }}>Terms of Service</MuiLink>
              {' '}and{' '}
              <MuiLink href="#" sx={{ color: "#101828", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</MuiLink>.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              sx={{ py: 1.5, bgcolor: "#101828", "&:hover": { bgcolor: "#1D2939" }, fontWeight: 700 }}
            >
              Get Started
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ mt: 4, color: "#667085" }}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" sx={{ fontWeight: 600, color: "#101828", textDecoration: "none" }}>
              Log in
            </MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
