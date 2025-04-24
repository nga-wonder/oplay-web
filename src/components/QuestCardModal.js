import React, { useState, useEffect, useRef } from "react";
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
  onStartDrawing,
  onDraw,
  onStopDrawing,
  initializeHeartCanvas,
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const hasInitializedCanvas = useRef(false);

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

  // Initialize canvas when challenge starts
  useEffect(() => {
    if (
      challengeStarted &&
      canvasRef.current &&
      (quest?.type === "challenge" || quest?.type === "heart_challenge")
    ) {
      if (!hasInitializedCanvas.current) {
        console.log("Initializing canvas for quest:", quest);
        initializeHeartCanvas(canvasRef.current);
        hasInitializedCanvas.current = true;
      }
    }
    // Reset initialization flag when challenge ends or modal closes
    if (!challengeStarted || !open) {
      hasInitializedCanvas.current = false;
    }
  }, [challengeStarted, open, quest, canvasRef, initializeHeartCanvas]);

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
      <Box className="modal-content">
        {/* Left Side: Question and Supporting Image */}
        <Box className="left-panel">
          {quest && (
            <>
              <Typography className="quest-description" sx={{ whiteSpace: 'pre-line' }}>
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
          )}
        </Box>

        {/* Right Side: Choices, Camera, or Drawing Frame */}
        <Box className="right-panel">
          {quest && (
            <>
              {quest.type === "questionnaire" && (
                <Box className="choices-container">
                  <Box className="answer-grid">
                    {quest.answers.map((answer, index) => (
                      <Button
                        key={index}
                        variant="contained"
                        className="action-button"
                        onClick={() => handleAnswerClick(answer)}
                        sx={{
                          backgroundColor:
                            selectedAnswer === answer.text
                              ? isCorrect
                                ? "#4caf50"
                                : "#f44336"
                              : "#1976d2",
                          color:
                            selectedAnswer === answer.text && isCorrect ? "#000000" : "#ffffff",
                          "&:hover": {
                            backgroundColor:
                              selectedAnswer === answer.text
                                ? isCorrect
                                  ? "#45a049"
                                  : "#d32f2f"
                                : "#1565c0",
                          },
                        }}
                        disabled={selectedAnswer !== null}
                      >
                        {answer.text}
                      </Button>
                    ))}
                  </Box>
                  {selectedAnswer && (
                    <Typography className="quest-description" sx={{ marginTop: 2, whiteSpace: 'pre-line' }}>
                      {isCorrect ? (quest.rewards || "Correct!") : "Incorrect, try another quest!"}
                    </Typography>
                  )}
                </Box>
              )}
              {(quest.type === "challenge" || quest.type === "heart_challenge") &&
                !challengeStarted &&
                !showResult && (
                  <Button
                    variant="contained"
                    className="action-button"
                    onClick={onStartChallenge}
                  >
                    Start Challenge
                  </Button>
                )}
              {(quest.type === "challenge" || quest.type === "heart_challenge") &&
                challengeStarted && (
                  <Box className="drawing-container">
                    <Typography className="quest-description">
                      Time Left: {timeLeft} seconds
                    </Typography>
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={300}
                      style={{ border: "1px solid black", marginTop: "10px" }}
                      onMouseDown={onStartDrawing}
                      onMouseMove={onDraw}
                      onMouseUp={onStopDrawing}
                      onMouseOut={onStopDrawing}
                    />
                  </Box>
                )}
              {(quest.type === "challenge" || quest.type === "heart_challenge") &&
                showResult && (
                  <Box>
                    <Typography className="quest-description">
                      Outline Accuracy: {fillPercentage ? fillPercentage.toFixed(2) : 0}%
                    </Typography>
                    <Typography className="quest-description" sx={{ marginTop: 1, whiteSpace: 'pre-line' }}>
                      {fillPercentage >= quest.passThreshold
                        ? quest.rewards || "Congratulations! You passed!"
                        : "Sorry, you didn't trace enough. Try again!"}
                    </Typography>
                  </Box>
                )}
              {quest.type === "photo" && !photoTaken && !photoData && (
                <Box className="camera-container">
                  <Button
                    variant="contained"
                    className="action-button"
                    onClick={onStartCamera}
                  >
                    Start Camera
                  </Button>
                </Box>
              )}
              {quest.type === "photo" && cameraStream && !photoTaken && (
                <Box className="camera-container">
                  <video ref={videoRef} style={{ width: "100%", maxHeight: "300px" }} />
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
              {quest.type === "photo" && photoData && (
                <Box className="photo-container">
                  <img
                    src={photoData}
                    alt="Captured"
                    style={{ width: "100%", maxHeight: "300px" }}
                  />
                  <canvas ref={photoCanvasRef} style={{ display: "none" }} />
                </Box>
              )}
            </>
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