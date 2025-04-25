import React from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


// Styled Back Button
const StyledBackButton = styled(IconButton)(({ theme, disabled }) => ({
  position: "absolute",
  left: "12vh",
  top: "1.5vw",
  backgroundColor: "rgb(241, 228, 179)",
  borderRadius: "50%",
  padding: "10px",
  boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
  zIndex: 2,
  "&:hover": {
    backgroundColor: "rgb(138, 201, 187)",
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