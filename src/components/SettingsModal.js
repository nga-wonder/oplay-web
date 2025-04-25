import React from "react";
import { Modal, Box, Typography, Slider, Button, IconButton } from "@mui/material";
import { ChromePicker } from "react-color";
import CloseIcon from "@mui/icons-material/Close";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PaletteIcon from '@mui/icons-material/Palette';
import "../css/SettingsModal.css";

const SettingsModal = ({
  open,
  onClose,
  pieceColor,
  onColorChange,
  soundVolume,
  onVolumeChange,
}) => {
  const handleColorChange = (color) => {
    const rgb = [color.rgb.r, color.rgb.g, color.rgb.b];
    onColorChange({ rgb });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="modal-box">
        <IconButton onClick={onClose} className="close-button">
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" className="cloud-typography">
          Game Settings
        </Typography>

        <Typography variant="subtitle1" className="cloud-typography">
          <PaletteIcon className="icon" />
        </Typography>

        <Box className="color-picker-container">
          <div className="chrome-picker-wrapper">
            <ChromePicker
              color={{ r: pieceColor[0], g: pieceColor[1], b: pieceColor[2] }}
              onChangeComplete={handleColorChange}
              disableAlpha={true}
            />
          </div>
        </Box>


        <Typography variant="subtitle1" className="cloud-typography">
          <VolumeUpIcon className="icon" />
        </Typography>

        <Slider
          value={soundVolume}
          onChange={onVolumeChange}
          aria-labelledby="sound-volume-slider"
          min={0}
          max={100}
          className="volume-slider"
        />

        <Button
          variant="contained"
          onClick={onClose}
          fullWidth
          className="save-button"
        >
          Save & Close
        </Button>
      </Box>
    </Modal>
  );
};

export default SettingsModal;
