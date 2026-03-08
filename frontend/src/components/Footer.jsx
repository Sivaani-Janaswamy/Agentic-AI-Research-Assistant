import React from "react";
import { Box, Typography, Container, Divider } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        mt: "auto",
        py: 4,
        background: "#F8FAFF",
        borderTop: "1px solid #EAECF0"
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          sx={{ color: "#667085", textAlign: "center", fontWeight: 500 }}
        >
          © {new Date().getFullYear()} AI Researcher | Empowering Academic Discovery
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
