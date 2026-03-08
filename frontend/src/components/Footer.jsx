import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        width: "100%",
        mt: 5,
        py: 2,
        textAlign: "center",
        background: "#F8FAFF",
        borderTop: "1px solid #D6E9FF"
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: "#374151" }}
      >
        © {new Date().getFullYear()} AI Research Assistant | Built for Smart Research
      </Typography>
    </Box>
  );
};

export default Footer;