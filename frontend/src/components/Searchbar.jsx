import React from "react";
import { Box, InputBase, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";

const Searchbar = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        mb: 4
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          background: "#000",
          borderRadius: "40px",
          px: 2,
          py: 0.5,
        }}
      >
        {/* Left Menu Icon */}
        <IconButton sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>

        {/* Input */}
        <InputBase
          placeholder="Hinted search text"
          sx={{
            flex: 1,
            color: "white",
            px: 2,
            fontSize: "0.95rem"
          }}
        />

        {/* Search Icon */}
        <IconButton sx={{ color: "white" }}>
          <SearchIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Searchbar;