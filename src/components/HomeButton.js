import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconButton, Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

function HomeButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      return; // Stay on HomePage, no pop-up needed
    }
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    navigate("/");
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Home Icon Button (Fixed on Top-Left Corner) */}
      <IconButton
        onClick={handleHomeClick}
        sx={{
          position: "fixed",
          top: "1.5vw",
          left: "3vh",
          backgroundColor: "white",
          borderRadius: "50%",
          boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
          width: { xs: "40px", sm: "50px", md: "60px" },  // responsive width
          height: { xs: "40px", sm: "50px", md: "60px" }, // same height for circular shape
        }}
      >
        <HomeIcon sx={{ fontSize: { xs: 20, sm: 24, md: 30 } }} />
      </IconButton>

      {/* Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ fontSize: "1.2rem", textAlign: "center" }}>
          Are you sure to go back to Home?
        </DialogTitle>
        <DialogActions sx={{ display: "flex", justifyContent: "center", paddingBottom: "20px" }}>
          <Button onClick={handleConfirm} sx={{ backgroundColor: "#BDBDBD", color: "black" }}>
            Yes
          </Button>
          <Button onClick={handleClose} sx={{ backgroundColor: "#BDBDBD", color: "black" }}>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default HomeButton;
