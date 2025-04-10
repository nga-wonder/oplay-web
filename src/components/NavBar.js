import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

function NavBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Game App</Typography>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
