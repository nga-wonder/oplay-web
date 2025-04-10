import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Grid, Button, Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import NavBar from "../components/NavBar";

// Styled Game Button
const GameButton = styled(Button)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "150px",
  fontSize: "1.5rem",
  fontWeight: "bold",
  borderRadius: "20px",
  border: "3px solid #FF8C00",
  backgroundColor: "#FFC107",
  color: "black",
  overflow: "hidden",
  transition: "0.3s",
  "&:hover": {
    backgroundColor: "#FFA000",
    borderColor: "#E65100",
    transform: "scale(1.05)",
  },
}));

// Styled Toggle Bar
const ToggleContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  marginBottom: "20px",
});

const LeaderboardBox = styled(Box)({
  backgroundColor: "#FFF3E0",
  padding: "20px",
  borderRadius: "10px",
  border: "2px solid #FF8C00",
});

function Games() {
  const navigate = useNavigate();
  const [view, setView] = useState("gameChoose"); // Toggle state

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  return (
    <Container>
      <NavBar />

      {/* Toggle Bar */}
      <ToggleContainer>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          sx={{ backgroundColor: "#FFCC80", borderRadius: "10px", padding: "5px" }}
        >
          <ToggleButton value="gameChoose" sx={{ fontSize: "1rem", fontWeight: "bold", color: "black" }}>
            GameChoose
          </ToggleButton>
          <ToggleButton value="leaderboard" sx={{ fontSize: "1rem", fontWeight: "bold", color: "black" }}>
            Leaderboard
          </ToggleButton>
        </ToggleButtonGroup>
      </ToggleContainer>

      {/* GameChoose Section */}
      {view === "gameChoose" && (
        <Grid container spacing={3} sx={{ marginTop: 3 }}>
          {[
            { name: "Cờ cá ngựa", path: "/game1" },
            { name: "Ô ăn quan", path: "/game2" },
            { name: "Cờ vây", path: "/game3" },
            { name: "Cờ gánh", path: "/game4" },
          ].map((game, index) => (
            <Grid item xs={6} key={index}>
              <GameButton onClick={() => navigate(game.path)}>{game.name}</GameButton>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Leaderboard Section */}
      {view === "leaderboard" && (
        <LeaderboardBox>
          <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: "10px", color: "#D84315" }}>
            🏆 Leaderboard 🏆
          </Typography>
          {[
            { name: "Nguyen Van A", score: 100 },
            { name: "Tran Thi B", score: 95 },
            { name: "Le Hoang C", score: 90 },
            { name: "Pham Dinh D", score: 85 },
          ].map((player, index) => (
            <Typography key={index} variant="body1" sx={{ fontSize: "1.2rem", marginBottom: "5px" }}>
              {index + 1}. {player.name} - {player.score} pts
            </Typography>
          ))}
        </LeaderboardBox>
      )}
    </Container>
  );
}

export default Games;
