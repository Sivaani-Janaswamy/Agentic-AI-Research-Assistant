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
      default: "#f0f8ff", // Alice Blue
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
