import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "@mui/material";
import NavBar from "../components/NavBar";
import HomeButton from "../components/HomeButton";

<HomeButton confirm={false} />

function HomePage() {
  const navigate = useNavigate();

  return (
    <Container>
      <NavBar />
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate("/games")}
        sx={{ marginTop: 2 }}
      >
        Choose Game
      </Button>
    </Container>
  );
}

export default HomePage;
