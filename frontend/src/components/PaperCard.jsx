import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Chip
} from "@mui/material";

import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const PaperCard = () => {
  return (
    <Card
      sx={{
        width: "100%",
        p: 1, // Inner spacing
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)", // Subtle lift on hover
        }
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Category Chip */}
        <Chip 
          label="Computer Science" 
          size="small" 
          sx={{ 
            mb: 1.5, 
            bgcolor: "#F2F4F7", 
            color: "#344054", 
            fontWeight: 600,
            fontSize: "0.7rem" 
          }} 
        />

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 1,
            color: "#101828",
            cursor: "pointer",
            "&:hover": { color: "#101828cc" }
          }}
        >
          Advancements in Transformer Models for Large Language Tasks
        </Typography>

        {/* Authors and Metadata */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#667085",
              fontWeight: 500,
            }}
          >
            J. Smith, A. Johnson, et al.
          </Typography>
          <Box sx={{ width: 4, height: 4, bgcolor: "#D0D5DD", borderRadius: "50%" }} />
          <Typography
            variant="caption"
            sx={{
              color: "#667085",
              fontWeight: 500,
            }}
          >
            Published: Mar 2024
          </Typography>
        </Box>

        {/* Summary */}
        <Typography
          variant="body2"
          sx={{
            color: "#475467",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1
          }}
        >
          This paper explores the latest transformer architectures and their efficiency in 
          handling long-context windows for multi-modal tasks. We present a novel attention 
          mechanism that reduces computational complexity while maintaining accuracy...
        </Typography>

      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          pb: 1,
          pt: 0
        }}
      >
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Button
            size="small"
            variant="text"
            startIcon={<BookmarkBorderIcon />}
            sx={{ color: "#475467" }}
          >
            Save
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<DownloadIcon />}
            sx={{ color: "#475467" }}
          >
            PDF
          </Button>
        </Box>

        <Button
          size="small"
          variant="outlined"
          endIcon={<OpenInNewIcon />}
          sx={{ 
            borderColor: "#D0D5DD", 
            color: "#344054",
            "&:hover": { borderColor: "#101828", bgcolor: "transparent" }
          }}
        >
          View Full Paper
        </Button>
      </CardActions>
    </Card>
  );
};

export default PaperCard;
