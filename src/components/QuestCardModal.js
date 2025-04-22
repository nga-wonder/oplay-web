import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
// import questCardImage from "../assets/WEB_quest1.png";
import "../css/QuestCardModal.css";

function QuestCardModal({
  open,
  onClose,
  quest,
  inputNumber,
  onStartChallenge,
  challengeStarted,
  timeLeft,
  canvasRef,
  showResult,
  fillPercentage,
  photoTaken,
  photoData,
  cameraStream,
  onStartCamera,
  onTakePhoto,
  videoRef,
  photoCanvasRef,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className="quest-card-modal">
      <DialogTitle className='quest-card-title'> Quest Card for Number {inputNumber}</DialogTitle>
      <DialogContent className="quest-card-content">
        {quest ? (
          <Box>
            <Typography variant="h6">{quest.title}</Typography>
            <Typography>{quest.description}</Typography>
            {!challengeStarted && !showResult && (
              <Button
                variant="contained"
                color="primary"
                onClick={onStartChallenge}
                sx={{ marginTop: 2 }}
              >
                Start Challenge
              </Button>
            )}
            {challengeStarted && (
              <Box>
                <Typography>Time Left: {timeLeft} seconds</Typography>
                <canvas ref={canvasRef} width={300} height={300} />
              </Box>
            )}
            {showResult && (
              <Typography>
                Fill Percentage: {fillPercentage ? fillPercentage.toFixed(2) : 0}%
              </Typography>
            )}
            {!photoTaken && !photoData && (
              <Button
                variant="contained"
                color="primary"
                onClick={onStartCamera}
                sx={{ marginTop: 2 }}
              >
                Start Camera
              </Button>
            )}
            {cameraStream && !photoTaken && (
              <Box>
                <video ref={videoRef} autoPlay style={{ width: "100%" }} />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onTakePhoto}
                  sx={{ marginTop: 2 }}
                >
                  Take Photo
                </Button>
              </Box>
            )}
            {photoData && (
              <Box>
                <img src={photoData} alt="Captured" style={{ width: "100%" }} />
                <canvas ref={photoCanvasRef} style={{ display: "none" }} />
              </Box>
            )}
          </Box>
        ) : (
          <Typography>No quest available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuestCardModal;