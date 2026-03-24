import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import Lottie from "lottie-react";
import beeAnimation from "../assets/bee.json";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { isAuthenticated } from "../api/auth";

const Landing = () => {
  const authed = isAuthenticated();
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "radial-gradient(circle at 20% 20%, #F4F5FF 0, #F8FAFF 40%, #FFFFFF 100%)" }}>
      <Navbar />
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          pt: { xs: 10, md: 14 },
          pb: { xs: 8, md: 12 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="overline" sx={{ letterSpacing: 1, color: "#7F56D9", fontWeight: 700 }}>
            Agentic AI Research Assistant
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1, color: "#101828" }}>
            Turn papers into insights with BeeResearch.
          </Typography>
          <Typography variant="body1" sx={{ color: "#475467", maxWidth: 560 }}>
            Upload PDFs, search recent literature, compare findings, and track your history—all with a playful touch.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: 999, px: 3, py: 1.1, textTransform: "none", fontWeight: 700 }}
              onClick={() => (window.location.href = "/home")}
            >
              {authed ? "Open the App" : "Start exploring"}
            </Button>
            {!authed && (
              <Button
                variant="outlined"
                sx={{ borderRadius: 999, px: 3, py: 1.1, textTransform: "none", fontWeight: 700, borderColor: "#D0D5DD", color: "#344054" }}
                onClick={() => (window.location.href = "/signup")}
              >
                Sign up / Log in
              </Button>
            )}
          </Box>
          <Box id="features" sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 3 }}>
            {["Upload & summarize", "Crossref live trends", "Compare papers", "Save favorites"].map((item) => (
              <Box
                key={item}
                sx={{
                  px: 2.5,
                  py: 1.2,
                  borderRadius: 999,
                  background: "#F2F4F7",
                  color: "#344054",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {item}
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(127,86,217,0.12) 0%, rgba(255,255,255,0) 65%)",
              filter: "blur(10px)",
            }}
          />
          <Box sx={{ width: 360, maxWidth: "90%", position: "relative" }}>
            <Lottie
              animationData={beeAnimation}
              loop
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Landing;
