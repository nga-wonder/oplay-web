import React, { useState, useEffect } from "react";
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
  cameraError,
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Reset state when the quest changes or modal closes
  useEffect(() => {
    if (!open || quest) {
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  }, [open, quest]);

  // Play video when cameraStream changes
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((err) => {
        console.error("Error playing video in QuestCardModal:", err);
      });
    }
  }, [cameraStream, videoRef]);

  if (!open) return null;

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer.text);
    if (quest.correctAnswerId) {
      setIsCorrect(answer.id === quest.correctAnswerId);
    } else {
      console.warn("No correctAnswerId provided for this quest.");
      setIsCorrect(false);
    }
  };

  return (
    <Box className="quest-card-modal" role="dialog" aria-labelledby="quest-card-title">
      {/* <Box className="modal-header">
        <Typography variant="h5" id="quest-card-title" className="quest-card-title">
          Quest Card for Number {inputNumber}
        </Typography>
      </Box> */}
      <Box className="modal-content">
        {/* Left Side: Question and Supporting Image */}
        <Box className="left-panel">
          {quest ? (
            <>
              <Typography variant="h6" className="quest-title">
                {quest.title}
              </Typography>
              <Typography className="quest-description">
                {quest.description}
              </Typography>
              {quest.image && (
                <Box sx={{ textAlign: "center", marginTop: 2 }}>
                  <img
                    src={quest.image}
                    alt={quest.title}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "250px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                    onError={() => console.error(`Failed to load image: ${quest.image}`)}
                  />
                </Box>
              )}
            </>
          ) : (
            <Typography className="quest-description">No quest available</Typography>
          )}
        </Box>
        {/* Right Side: Choices, Camera, or Drawing */}
        <Box className="right-panel">
          {quest?.type === "questionnaire" && (
            <Box className="choices-container">
              <Box className="answer-grid">
                {quest.answers.map((answer, index) => (
                  <Button
                    key={index}
                    variant="contained"
                    className="action-button"
                    onClick={() => handleAnswerClick(answer)}
                    sx={{
                      margin: "5px",
                      width: "100%",
                      backgroundColor: selectedAnswer === answer.text ? (isCorrect ? "#4caf50" : "#f44336") : "#0080ff",
                      color: selectedAnswer === answer.text && isCorrect ? "#000000" : "#ffffff",
                      "&:hover": {
                        backgroundColor: selectedAnswer === answer.text ? (isCorrect ? "#45a049" : "#d32f2f") : "#1565c0",
                      },
                    }}
                    disabled={selectedAnswer !== null}
                  >
                    {answer.text}
                  </Button>
                ))}
              </Box>
              {selectedAnswer && (
                <Typography className="quest-description" sx={{ marginTop: 2, textAlign: "center" }}>
                  {isCorrect ? "Correct!" : "Incorrect, try another quest!"}
                </Typography>
              )}
            </Box>
          )}
          {quest?.type === "challenge" && !challengeStarted && !showResult && (
            <Button
              variant="contained"
              className="action-button"
              onClick={onStartChallenge}
              sx={{ width: "100%", marginTop: 2 }}
            >
              Start Challenge
            </Button>
          )}
          {quest?.type === "challenge" && challengeStarted && (
            <Box className="drawing-container">
              <Typography className="quest-description" sx={{ textAlign: "center" }}>
                Time Left: {timeLeft} seconds
              </Typography>
              <canvas ref={canvasRef} width={300} height={300} style={{ border: "1px solid #000" }} />
            </Box>
          )}
          {quest?.type === "challenge" && showResult && (
            <Typography className="quest-description" sx={{ textAlign: "center" }}>
              Fill Percentage: {fillPercentage ? fillPercentage.toFixed(2) : 0}%
            </Typography>
          )}
          {quest?.type === "photo" && !photoTaken && !photoData && (
            <Box className="camera-container">
              <Button
                variant="contained"
                className="action-button"
                onClick={onStartCamera}
                sx={{ width: "100%", marginTop: 2 }}
                disabled={!!cameraError}
              >
                Start Camera
              </Button>
              {cameraError && (
                <Typography sx={{ marginTop: 2, color: "red", textAlign: "center" }}>
                  {cameraError}
                </Typography>
              )}
            </Box>
          )}
          {quest?.type === "photo" && cameraStream && !photoTaken && (
            <Box className="camera-container">
              <video ref={videoRef} style={{ width: "100%", maxHeight: "300px" }} />
              <Button
                variant="contained"
                className="action-button"
                onClick={onTakePhoto}
                sx={{ width: "100%", marginTop: 2 }}
              >
                Take Photo
              </Button>
            </Box>
          )}
          {quest?.type === "photo" && photoData && (
            <Box className="photo-container">
              <img src={photoData} alt="Captured" style={{ width: "100%", maxHeight: "300px" }} />
              <canvas ref={photoCanvasRef} style={{ display: "none" }} />
            </Box>
          )}
        </Box>
      </Box>
      <Box className="modal-footer">
        <Button onClick={onClose} className="close-button">
          Close
        </Button>
      </Box>
    </Box>
  );
}

export default QuestCardModal;