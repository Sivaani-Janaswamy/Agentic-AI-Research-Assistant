import React from "react";
import { Box, Typography, Container } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        mt: "auto",
        py: 6,
        background: "linear-gradient(90deg, #7F56D9 0%, #5D3FB4 100%)",
        color: "#FFFFFF",
        borderTop: "none",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            color: "#101828"
          }}
        >
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
            {["Privacy", "Terms", "Support", "Contact"].map((item) => (
              <Typography
                key={item}
                variant="body2"
                sx={{ color: "#101828",opacity: 0.9, cursor: "pointer", "&:hover": { opacity: 1 } }}
              >
                {item}
              </Typography>
            ))}
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: "#101828",
              opacity: 0.85,
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            © {new Date().getFullYear()} BeeResearch. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
