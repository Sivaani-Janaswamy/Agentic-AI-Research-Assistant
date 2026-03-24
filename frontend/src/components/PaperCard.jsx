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

const PaperCard = ({ paper, onSave }) => {
  const { 
    title = "Untitled Paper", 
    authors = "Unknown Authors", 
    publish_date = "N/A", 
    abstract = "No abstract available.",
    category = "Research",
    pdf_url
  } = paper || {};

  const sentences = abstract
    ? abstract.split(/(?<=[.!?])\s+/).filter(Boolean)
    : [];
  const bullets = sentences.slice(0, 3);
  const tldr = sentences[0] || abstract;

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
          label={category} 
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
          onClick={() => pdf_url && window.open(pdf_url, '_blank')}
        >
          {title}
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
            {authors}
          </Typography>
          <Box sx={{ width: 4, height: 4, bgcolor: "#D0D5DD", borderRadius: "50%" }} />
          <Typography
            variant="caption"
            sx={{
              color: "#667085",
              fontWeight: 500,
            }}
          >
            Published: {publish_date}
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
          {abstract}
        </Typography>

        {/* Bullet points */}
        {bullets.length > 0 && (
          <Box component="ul" sx={{ pl: 3, mt: 1, mb: 1.5, color: "#475467" }}>
            {bullets.map((line, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>{line}</li>
            ))}
          </Box>
        )}

        {/* TL;DR */}
        {tldr && (
          <Typography variant="body2" sx={{ color: "#101828", fontWeight: 600, mb: 1 }}>
            TL;DR:{" "}
            <Typography component="span" variant="body2" sx={{ color: "#475467", fontWeight: 500 }}>
              {tldr}
            </Typography>
          </Typography>
        )}

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
            onClick={() => onSave && onSave(paper)}
          >
            Save
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<DownloadIcon />}
            sx={{ color: "#475467" }}
            onClick={() => pdf_url && window.open(pdf_url, '_blank')}
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
          onClick={() => pdf_url && window.open(pdf_url, '_blank')}
        >
          View Full Paper
        </Button>
      </CardActions>
    </Card>
  );
};

export default PaperCard;
