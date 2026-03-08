import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const PaperCard = () => {
  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: "10px", // Already 10px, matches desired
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)", // Soft shadow
        border: "1px solid #e0e0e0", // Existing soft border
        background: "#fff"
      }}
    >
      <CardContent>

        {/* Title */}
        <Typography
          variant="h5" // Slightly stronger title variant
          sx={{
            fontWeight: 700, // Make title bolder
            mb: 1
          }}
        >
          Paper Title
        </Typography>

        {/* Authors */}
        <Typography
          variant="subtitle2"
          sx={{
            color: "#666", // Subtle color
            mb: 2,
            fontStyle: 'italic' // Make authors more subtle
          }}
        >
          Author Name
        </Typography>

        {/* Summary */}
        <Typography
          variant="body2"
          sx={{
            color: "#555",
            lineHeight: 1.6
          }}
        >
          This is a summary of the research paper. It provides a brief overview
          of the paper's content and findings.
        </Typography>

      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          px: 2,
          pb: 2
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>

          <Button
            size="small"
            startIcon={<SaveIcon />}
            sx={{
              textTransform: "none",
              color: "black", // Use primary color for consistency
              '&:hover': {
                backgroundColor: 'lightgray', // Subtle hover effect
                color: 'primary.contrastText', // Ensure readability on hover
              }
            }}
          >
            Save
          </Button>

          <Button
            size="small"
            startIcon={<PictureAsPdfIcon />}
            sx={{
              textTransform: "none",
              color: "black", // Use primary color for consistency
              '&:hover': {
                backgroundColor: 'lightgray', // Subtle hover effect
                color: 'primary.contrastText', // Ensure readability on hover
              }
            }}
          >
            Download PDF
          </Button>

        </Box>
      </CardActions>
    </Card>
  );
};

export default PaperCard;