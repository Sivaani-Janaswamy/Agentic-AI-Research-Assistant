import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#101828", // Darker primary for a more professional feel
    },
    secondary: {
      main: "#667085", // Muted grey for secondary text
    },
    background: {
      default: "#F8FAFF", // Light blue-ish background as requested
      paper: "#ffffff",
    },
    text: {
      primary: "#101828",
      secondary: "#667085",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: "#101828",
    },
    h5: {
      fontWeight: 700,
      color: "#101828",
    },
    h6: {
      fontWeight: 600,
      color: "#101828",
    },
    subtitle1: {
      fontWeight: 500,
      color: "#667085",
    },
    subtitle2: {
      fontWeight: 500,
      color: "#667085",
    },
    body1: {
      color: "#344054",
    },
    body2: {
      color: "#475467",
    },
  },
  shape: {
    borderRadius: 12, // Increased to 12px for softer look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          border: "1px solid #EAECF0",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)",
          },
        },
      },
    },
  },
});

export default theme;
