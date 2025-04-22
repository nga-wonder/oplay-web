import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import HomeButton from "../components/HomeButton";
import BackButton from "../components/BackButton";
import "../css/Play1.css";

const PlayButton = styled(Button)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: "bold",
  padding: "20px 40px",
  borderRadius: "15px",
  background: "linear-gradient(135deg, #FFC107, #FF8C00)",
  color: "white",
  textTransform: "uppercase",
  boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #FFA000, #E65100)",
    transform: "translateY(-5px)",
    boxShadow: "0 12px 20px rgba(0, 0, 0, 0.3)",
  },
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
    transition: "0.5s",
  },
  "&:hover:before": {
    left: "100%",
  },
}));

function Play1() {
  const navigate = useNavigate();

  return (
    <div className="play1-background">
      <Container
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BackButton />
        <HomeButton />
        <PlayButton onClick={() => navigate("/game1")}>PLAY</PlayButton>
      </Container>
    </div>
  );
}

export default Play1;