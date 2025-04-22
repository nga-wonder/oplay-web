import React from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Keyframe for glow animation
const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 140, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 140, 0, 0.8); }
  100% { box-shadow: 0 0 5px rgba(255, 140, 0, 0.5); }
`;

// Styled Back Button
const StyledBackButton = styled(IconButton)(({ theme, disabled }) => ({
  position: "absolute",
  left: "20px",
  top: "20px",
  color: disabled ? "rgba(255, 140, 0, 0.3)" : "#FF8C00",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(5px)",
  borderRadius: "50%",
  padding: "10px",
  animation: disabled ? "none" : `${glow} 2s infinite`,
  transition: "transform 0.3s ease",
  zIndex: 2,
  "&:hover": {
    backgroundColor: disabled ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 140, 0, 0.3)",
    transform: disabled ? "none" : "rotate(360deg) scale(1.2)",
  },
}));

function BackButton({ disabled = false }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (!disabled) {
      navigate(-1);
    }
  };

  return (
    <StyledBackButton onClick={handleBack} disabled={disabled}>
      <ArrowBackIcon fontSize="large" />
    </StyledBackButton>
  );
}

export default BackButton;