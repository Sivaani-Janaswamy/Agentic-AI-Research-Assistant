import { Box, Container, Typography } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import PaperCard from "../components/PaperCard";
import Searchbar from "../components/Searchbar";

function Home() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <Navbar />

      <Box sx={{ display: "flex", flex: 1, mt: { xs: "64px", lg: "72px" } }}>
        {/* History Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4, lg: 6 },
            ml: { lg: "280px", xs: 0 },
            background: "#F8FAFF",
            minHeight: "calc(100vh - 72px)"
          }}
        >
          <Container maxWidth="md">
            {/* Search Bar */}
            <Box sx={{ mb: { xs: 4, sm: 6 } }}>
              <Searchbar />
            </Box>

            {/* Section Heading */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              Recent Research Papers
            </Typography>

            {/* Paper Cards (Vertical Stack) */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}>
              <PaperCard />
              <PaperCard />
              <PaperCard />
              <PaperCard />
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}

export default Home;
