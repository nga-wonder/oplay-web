import React from "react";
import { Container } from "@mui/material";
import HomeButton from "../components/HomeButton";
import NavBar from "../components/NavBar";



function Game1() {
  return (
    <Container>
      <NavBar />
      <HomeButton /> {/* No confirmation needed */}
      <h1>Game 1 Page</h1>
    </Container>
  );
}

export default Game1;
