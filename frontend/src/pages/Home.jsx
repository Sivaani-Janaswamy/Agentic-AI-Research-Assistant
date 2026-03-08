import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import PaperCard from "../components/PaperCard";
import Searchbar from "../components/Searchbar";

function Home() {

  return (
    <Box sx={{ minHeight: "100vh", background: "#F8FAFF" }}>

      {/* Navbar */}
      <Navbar />

      {/* History Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        sx={{
          mt: 10, // Margin top to clear the fixed Navbar
          p: 3, // Consistent padding around the main content
          ml: { lg: "280px", xs: 0 } // Adjust ml to match new Sidebar width
        }}
      >

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}> {/* Consistent margin bottom after searchbar */}
          <Searchbar />
        </Box>

        {/* Paper Cards (Vertical Stack) */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          <PaperCard />
          <PaperCard />
          <PaperCard />
          <PaperCard />

        </Box>

      </Box>

      {/* Footer */}
      <Footer />

    </Box>
  );
}

export default Home;