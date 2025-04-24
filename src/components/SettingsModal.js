import React from "react";
import { Modal, Box, Typography, Slider, Button, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChromePicker } from "react-color";
import CloseIcon from "@mui/icons-material/Close";

const ModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 200, 100, 0.7))",
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  borderRadius: "20px",
  padding: "24px",
  border: "2px solid #FFD700",
  animation: "fadeIn 0.3s ease-in-out",
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translate(-50%, -60%)" },
    to: { opacity: 1, transform: "translate(-50%, -50%)" },
  },
}));

const CloudTypography = styled(Typography)(({ theme }) => ({
  color: "#FF8C00",
  fontWeight: "bold",
  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
  marginBottom: "16px",
}));

const VolumeSlider = styled(Slider)(({ theme }) => ({
  color: "#FF8C00",
  "& .MuiSlider-thumb": {
    backgroundColor: "#FFD700",
    boxShadow: "0 0 8px rgba(255, 215, 0, 0.5)",
    "&:hover": {
      boxShadow: "0 0 12px rgba(255, 215, 0, 0.8)",
    },
  },
  "& .MuiSlider-rail": {
    backgroundColor: "rgba(255, 140, 0, 0.3)",
  },
  "& .MuiSlider-track": {
    background: "linear-gradient(90deg, #FF8C00, #FFD700)",
  },
}));

const ColorPickerContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginBottom: "24px",
  padding: "16px",
  background: "rgba(255, 255, 255, 0.8)",
  borderRadius: "12px",
  border: "1px solid #FFD700",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "12px",
  right: "12px",
  color: "#FF8C00",
  "&:hover": {
    backgroundColor: "rgba(255, 140, 0, 0.1)",
  },
}));

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
      <ModalBox>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
        <CloudTypography variant="h5">
          Game Settings
        </CloudTypography>
        <CloudTypography variant="subtitle1">
          Piece LED Color
        </CloudTypography>
        <ColorPickerContainer>
          <ChromePicker
            color={{ r: pieceColor[0], g: pieceColor[1], b: pieceColor[2] }}
            onChangeComplete={handleColorChange}
            disableAlpha={true}
          />
        </ColorPickerContainer>
        <CloudTypography variant="subtitle1">
          Sound Volume
        </CloudTypography>
        <VolumeSlider
          value={soundVolume}
          onChange={onVolumeChange}
          aria-labelledby="sound-volume-slider"
          min={0}
          max={100}
          sx={{ mb: 3 }}
        />
        <Button
          variant="contained"
          onClick={onClose}
          fullWidth
          sx={{
            background: "linear-gradient(90deg, #FF8C00, #FFD700)",
            color: "white",
            fontWeight: "bold",
            "&:hover": {
              background: "linear-gradient(90deg, #FF7000, #FFC107)",
            },
          }}
        >
          Save & Close
        </Button>
      </ModalBox>
    </Modal>
  );
};

export default SettingsModal;