import React from "react";
import { Button, Typography, Box } from "@mui/material";
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
  if (!open) return null;

  return (
    <Box className="quest-card-modal" role="dialog" aria-labelledby="quest-card-title">
      <Box className="centered-content">
        <Typography variant="h5" id="quest-card-title" className="quest-card-title">
          Quest Card for Number {inputNumber}
        </Typography>
        <Box className="quest-card-content">
          {quest ? (
            <Box>
              <Typography variant="h6" className="quest-title">
                {quest.title}
              </Typography>
              <Typography className="quest-description">
                {quest.description}
              </Typography>
              {!challengeStarted && !showResult && (
                <Button
                  variant="contained"
                  className="action-button"
                  onClick={onStartChallenge}
                  sx={{ marginTop: 2 }}
                >
                  Start Challenge
                </Button>
              )}
              {challengeStarted && (
                <Box>
                  <Typography className="quest-description">
                    Time Left: {timeLeft} seconds
                  </Typography>
                  <canvas ref={canvasRef} width={300} height={300} />
                </Box>
              )}
              {showResult && (
                <Typography className="quest-description">
                  Fill Percentage: {fillPercentage ? fillPercentage.toFixed(2) : 0}%
                </Typography>
              )}
              {!photoTaken && !photoData && (
                <Button
                  variant="contained"
                  className="action-button"
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
                    className="action-button"
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
            <Typography className="quest-description">No quest available</Typography>
          )}
        </Box>
        <Box className="quest-card-actions">
          <Button onClick={onClose} className="close-button">
            Close
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default QuestCardModal;