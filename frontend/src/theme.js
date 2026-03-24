import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7F56D9", // Landing purple
    },
    secondary: {
      main: "#101828",
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
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "radial-gradient(circle at 20% 20%, #F4F5FF 0, #F8FAFF 38%, #FFFFFF 100%)",
          color: "#101828",
          minHeight: "100vh",
          WebkitFontSmoothing: "antialiased",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          color: "#101828",
          borderBottom: "1px solid #EAECF0",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "999px",
          boxShadow: "0 10px 30px -12px rgba(127,86,217,0.4)",
        },
        containedPrimary: {
          "&:hover": {
            boxShadow: "0 10px 30px -10px rgba(127,86,217,0.5)",
          },
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
          borderRadius: "14px",
          border: "1px solid #EAECF0",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 999,
        },
      },
    },
  },
});

export default theme;
