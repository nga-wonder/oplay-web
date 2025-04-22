feeimport React from "react";
import { Container, Typography } from "@mui/material";
import NavBar from "../components/NavBar";

function Play() {
  return (
    <Container>
      <NavBar />
      <Typography variant="h4" sx={{ marginTop: 2 }}>
        Welcome to the Play Page!
      </Typography>
    </Container>
  );
}

export default Play;
