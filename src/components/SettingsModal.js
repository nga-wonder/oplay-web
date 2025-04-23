import React from "react";
import { Modal, Box, Typography, Slider, Button } from "@mui/material";
import { ChromePicker } from "react-color";

const SettingsModal = ({
  open,
  onClose,
  backgroundColor,
  onColorChange,
  soundVolume,
  onVolumeChange,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "white",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Settings
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Background Color
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <ChromePicker color={backgroundColor} onChange={onColorChange} />
        </Box>
        <Typography variant="subtitle1" gutterBottom>
          Sound Volume
        </Typography>
        <Slider
          value={soundVolume}
          onChange={onVolumeChange}
          aria-labelledby="sound-volume-slider"
          min={0}
          max={100}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={onClose} fullWidth>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default SettingsModal;