import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "@mui/material";
import HomeButton from "../components/HomeButton";
import "../css/HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-background">
      <Container>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/games")}
          sx={{ marginTop: 2 }}
        >
          Bắt đầu thôi!
        </Button>
      </Container>
    </div>
  );
}

export default HomePage;