import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#82aae3", // Light Blue
    },
    secondary: {
      main: "#b0c4de", // Light Steel Blue
    },
    background: {
      default: "#F8FAFF", // Updated to match the requested design
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
  shape: {
    borderRadius: 10, // Updated to 10px for rounded corners
  },
});

export default theme;
