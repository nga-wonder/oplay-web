import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Button,
  Box,
  Typography,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import NavBar from "../components/NavBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CloseIcon from "@mui/icons-material/Close";

// Keyframes for animations
const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 140, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 140, 0, 0.8); }
  100% { box-shadow: 0 0 5px rgba(255, 140, 0, 0.5); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled Back Button
const BackButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  left: "20px",
  top: "20px",
  color: "#FF8C00",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(5px)",
  borderRadius: "50%",
  padding: "10px",
  animation: `${glow} 2s infinite`,
  transition: "transform 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 140, 0, 0.3)",
    transform: "rotate(360deg) scale(1.2)",
  },
}));

// Styled Rank Button
const RankButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: "20px",
  top: "20px",
  color: "#FFD700",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(5px)",
  borderRadius: "50%",
  padding: "10px",
  animation: `${pulse} 1.5s infinite`,
  transition: "transform 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    transform: "scale(1.2)",
  },
}));

// Styled Series Name
const SeriesName = styled(Typography)(({ theme }) => ({
  fontSize: "3rem",
  fontWeight: "bold",
  textAlign: "center",
  background: "linear-gradient(45deg, #FF8C00, #FFD700, #FF8C00)",
  backgroundSize: "200% 200%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  animation: `${gradientAnimation} 5s ease infinite`,
  textShadow: "2px 2px 10px rgba(255, 140, 0, 0.5)",
  fontFamily: "'Dancing Script', cursive",
  marginBottom: "40px",
  marginTop: "20px",
}));

// Styled Game Button
const GameButton = styled(Button)(({ theme }) => ({
  width: "100%",
  height: "200px",
  fontSize: "1.8rem",
  fontWeight: "bold",
  borderRadius: "20px",
  border: "none",
  background: "linear-gradient(135deg, #FFC107, #FF8C00)",
  color: "white",
  textTransform: "uppercase",
  boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
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

// Styled Leaderboard Box
const LeaderboardBox = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  border: "2px solid #FF8C00",
  padding: "20px",
  width: "90%",
  maxWidth: "500px",
  margin: "0 auto",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  animation: `${slideIn} 0.5s ease`,
  position: "relative",
}));

// Styled Close Button
const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "10px",
  right: "10px",
  color: "#FF8C00",
  "&:hover": {
    color: "#E65100",
    transform: "rotate(90deg)",
  },
  transition: "transform 0.3s ease",
}));

// Styled Leaderboard Item
const LeaderboardItem = styled(Box)(({ theme, rank }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: "15px",
  animation: `${slideIn} 0.5s ease`,
  animationDelay: `${rank * 0.1}s`,
  animationFillMode: "both",
}));

// Styled Rank Circle
const RankCircle = styled(Box)(({ theme }) => ({
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #FF8C00, #FFD700)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontWeight: "bold",
  fontSize: "1.2rem",
  marginRight: "15px",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
}));

// Styled Progress Bar
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: "10px",
  borderRadius: "5px",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  flex: 1,
  marginRight: "15px",
  "& .MuiLinearProgress-bar": {
    background: "linear-gradient(90deg, #FF8C00, #FFD700)",
  },
}));

function Games() {
  const navigate = useNavigate();
  const [view, setView] = useState("gameChoose");

  const handleViewChange = () => {
    setView(view === "gameChoose" ? "leaderboard" : "gameChoose");
  };

  const handleBack = () => {
    navigate("/"); // Adjust path as needed
  };

  return (
    <Container
      sx={{
        minHeight: "100vh",
        width: "100vw",
        maxWidth: "100%",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a1a, #2c2c2c)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <NavBar />

      {/* Back Button */}
      <BackButton onClick={handleBack}>
        <ArrowBackIcon fontSize="large" />
      </BackButton>

      {/* Rank Button */}
      <RankButton onClick={handleViewChange}>
        <EmojiEventsIcon fontSize="large" />
      </RankButton>

      {/* Series Name */}
      <SeriesName>Game Series</SeriesName>

      {/* GameChoose Section */}
      {view === "gameChoose" && (
        <Grid container spacing={4} sx={{ maxWidth: "800px", width: "90%" }}>
          {[
            { name: "Cờ cá ngựa", path: "/game1" },
            { name: "Ô ăn quan", path: "/game2" },
            { name: "Cờ vây", path: "/game3" },
            { name: "Cờ gánh", path: "/game4" },
          ].map((game, index) => (
            <Grid item xs={6} key={index}>
              <GameButton onClick={() => navigate(game.path)}>
                {game.name}
              </GameButton>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Leaderboard Section */}
      {view === "leaderboard" && (
        <LeaderboardBox>
          {/* Close Button */}
          <CloseButton onClick={handleViewChange}>
            <CloseIcon />
          </CloseButton>

          {/* Leaderboard Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              marginBottom: "20px",
              color: "#FFD700",
              textAlign: "center",
              textShadow: "1px 1px 5px rgba(0, 0, 0, 0.3)",
              fontFamily: "'Dancing Script', cursive",
            }}
          >
            Leaderboard
          </Typography>

          {/* Leaderboard Entries */}
          {[
            { name: "Nguyen Van A", streak: 15 },
            { name: "Tran Thi B", streak: 12 },
            { name: "Le Hoang C", streak: 10 },
            { name: "Pham Dinh D", streak: 8 },
          ].map((player, index) => {
            const maxStreak = 15; // Assuming 15 is the max streak for scaling the progress bar
            const progress = (player.streak / maxStreak) * 100;
            return (
              <LeaderboardItem key={index} rank={index + 1}>
                <RankCircle>{index + 1}</RankCircle>
                <StyledLinearProgress variant="determinate" value={progress} />
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "1.2rem",
                    minWidth: "150px",
                    textAlign: "right",
                  }}
                >
                  {player.name} - {player.streak} days
                </Typography>
              </LeaderboardItem>
            );
          })}
        </LeaderboardBox>
      )}
    </Container>
  );
}

export default Games;