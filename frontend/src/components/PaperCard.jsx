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
        borderRadius: "10px",
        boxShadow: "none",
        border: "1px solid #e0e0e0",
        background: "#fff"
      }}
    >
      <CardContent>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1
          }}
        >
          Paper Title
        </Typography>

        {/* Authors */}
        <Typography
          variant="subtitle2"
          sx={{
            color: "#666",
            mb: 2
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
              color: "#000"
            }}
          >
            Save
          </Button>

          <Button
            size="small"
            startIcon={<PictureAsPdfIcon />}
            sx={{
              textTransform: "none",
              color: "#000"
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