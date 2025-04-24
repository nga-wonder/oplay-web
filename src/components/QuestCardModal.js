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
  initializeCircleCanvas,
  initializeStarCanvas,
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [canvasRendered, setCanvasRendered] = useState(false);
  const hasInitializedCanvas = useRef(false);
  const finalCanvasRef = useRef(null);

  useEffect(() => {
    if (!open || quest) {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCanvasRendered(false);
    }
  }, [open, quest]);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((err) => {
        console.error("Error playing video in QuestCardModal:", err);
      });
    }
  }, [cameraStream, videoRef]);

  useEffect(() => {
    if (
      challengeStarted &&
      canvasRef.current &&
      (quest?.type === "heart_challenge" || quest?.type === "circle_challenge" || quest?.type === "star_challenge")
    ) {
      if (!hasInitializedCanvas.current) {
        console.log("Initializing canvas for quest:", quest);
        let initializeCanvas;
        if (quest?.type === "heart_challenge") {
          initializeCanvas = initializeHeartCanvas;
        } else if (quest?.type === "circle_challenge") {
          initializeCanvas = initializeCircleCanvas;
        } else if (quest?.type === "star_challenge") {
          initializeCanvas = initializeStarCanvas;
        }
        initializeCanvas(canvasRef.current);
        hasInitializedCanvas.current = true;
      }
    }
    if (!challengeStarted || !open) {
      hasInitializedCanvas.current = false;
    }
  }, [
    challengeStarted,
    open,
    quest,
    canvasRef,
    initializeHeartCanvas,
    initializeCircleCanvas,
    initializeStarCanvas,
  ]);

  useEffect(() => {
    if (
      showResult &&
      finalCanvasRef.current &&
      canvasRef.current &&
      (quest?.type === "heart_challenge" ||
        quest?.type === "circle_challenge" ||
        quest?.type === "star_challenge")
    ) {
      // Use setTimeout to delay the copying slightly
      setTimeout(() => {
        const ctx = finalCanvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, finalCanvasRef.current.width, finalCanvasRef.current.height); // just in case
          ctx.drawImage(canvasRef.current, 0, 0);
          console.log("Final drawing copied to final canvas for quest:", quest?.type);
          setCanvasRendered(true);
        } else {
          console.error("Failed to get 2D context for final canvas");
        }
      }, 200); 
    }
  }, [showResult, quest, canvasRef, finalCanvasRef]);
  

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

  const passThreshold = (
    quest?.type === "heart_challenge" ||
    quest?.type === "circle_challenge" ||
    quest?.type === "star_challenge"
  ) ? 70 : quest?.passThreshold || 70;

  return (
    <Box className="quest-card-modal" role="dialog" aria-labelledby="quest-card-title">
      <Box className="modal-content">
        <Box className="left-panel">
          {quest && (
            <>
              <Typography variant="h6" className="quest-title">
                {quest.title}
              </Typography>
              <Typography className="quest-description">{quest.description}</Typography>
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
                    <Typography className="quest-description" sx={{ marginTop: 2 }}>
                      {isCorrect ? "Correct!" : "Incorrect, try another quest!"}
                    </Typography>
                  )}
                </Box>
              )}
              {(quest.type === "heart_challenge" || quest.type === "circle_challenge" || quest.type === "star_challenge") &&
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
              {(quest.type === "heart_challenge" || quest.type === "circle_challenge" || quest.type === "star_challenge") &&
                challengeStarted && (
                  <Box className="drawing-container">
                    <Typography className="quest-description">
                      Time Left: {timeLeft} seconds
                    </Typography>
                    <Typography className="quest-description">
                      {quest.type === "heart_challenge"
                        ? "Trace the heart outline with your cursor!"
                        : quest.type === "circle_challenge"
                        ? "Trace the circle outline with your cursor!"
                        : "Trace the star outline with your cursor!"}
                    </Typography>
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={300}
                      style={{ border: "1px solid black", marginTop: "5px", display: "block" }}
                      onMouseDown={onStartDrawing}
                      onMouseMove={onDraw}
                      onMouseUp={onStopDrawing}
                      onMouseOut={onStopDrawing}
                    />
                  </Box>
                )}
              {(quest.type === "heart_challenge" || quest.type === "circle_challenge" || quest.type === "star_challenge") &&
                showResult && (
                  <Box>
                    <Typography variant="h6" className="quest-title">
                      Challenge Result
                    </Typography>
                    <Typography className="quest-description">
                      Outline Accuracy: {fillPercentage ? fillPercentage.toFixed(2) : 0}%
                    </Typography>
                    <Typography className="quest-description" sx={{ marginTop: 1, whiteSpace: 'pre-line' }}>
                      {fillPercentage >= passThreshold
                        ? quest.rewards 
                        : quest.punish }
                    </Typography>
                    <Typography className="quest-description" sx={{ marginTop: 2 }}>
                      Your Final Drawing:
                    </Typography>
                    <canvas
                      ref={finalCanvasRef}
                      width={300}
                      height={300}
                      style={{ border: "1px solid black", marginTop: "10px", display: "block" }}
                      aria-label={`Final drawing of the ${quest?.type.replace("_challenge", "")} outline`}
                    />
                  </Box>
                )}
              {quest.type === "photo" && !photoTaken && (
                <Box className="camera-container">
                  <Button
                    variant="contained"
                    className="action-button"
                    onClick={onStartCamera}
                    sx={{ marginBottom: 2 }}
                  >
                    Start Camera
                  </Button>
                  {cameraStream && (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        style={{ width: "100%", maxHeight: "300px" }}
                      />
                      <Button
                        variant="contained"
                        className="action-button"
                        onClick={onTakePhoto}
                        sx={{ marginTop: 2 }}
                      >
                        Take Photo
                      </Button>
                      <canvas ref={photoCanvasRef} style={{ display: "none" }} />
                    </>
                  )}
                </Box>
              )}
              {quest.type === "photo" && photoTaken && photoData && (
                <Box className="photo-container">
                  <Typography className="quest-description">
                    Photo Captured!
                  </Typography>
                  <img
                    src={photoData}
                    alt="Captured"
                    style={{ width: "100%", maxHeight: "300px", marginTop: "10px" }}
                  />
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