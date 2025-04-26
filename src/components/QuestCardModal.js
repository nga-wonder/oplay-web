import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
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
      setTimeout(() => {
        const ctx = finalCanvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, finalCanvasRef.current.width, finalCanvasRef.current.height);
          ctx.drawImage(canvasRef.current, 0, 0);
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

  const passThreshold =
    quest?.type === "heart_challenge" ||
    quest?.type === "circle_challenge" ||
    quest?.type === "star_challenge"
      ? 70
      : quest?.passThreshold || 70;

  return (
    <Box className="quest-card-modal" role="dialog" aria-labelledby="quest-card-title">
      <Box className="modal-content">
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            height: "55px",
            width: "55px",
            top: 30,
            right: 30,
            backgroundColor: "rgb(252,245,219)",
            border: "5px solid rgb(241,187,102)",
            "&:hover": {
              backgroundColor: "rgb(241,187,102)",
            },
          }}
        >
          <CancelIcon sx={{ fontSize: "2.5rem" }} />
        </IconButton>

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
                      key={answer.id || index}
                      className={`answer-button color-${index % 4} ${
                        selectedAnswer === answer.text
                          ? isCorrect
                            ? quest.rewards
                            : quest.punish
                          : "default"
                      }`}
                      onClick={() => handleAnswerClick(answer)}
                      disabled={selectedAnswer !== null}
                    >
                      {answer.text}
                    </Button>
                  ))}

                  </Box>
                  {selectedAnswer && (
                    <Typography className="quest-description" sx={{ marginTop: 2, whiteSpace: 'pre-line' }}>
                      {isCorrect ? (quest.rewards) : (quest.punish)}
                    </Typography>
                  )}
                </Box>
              )}

              {(quest.type === "heart_challenge" ||
                quest.type === "circle_challenge" ||
                quest.type === "star_challenge") &&
                !challengeStarted &&
                !showResult && (
                  <Button 
                    variant="contained" 
                    className="action-button" 
                    onClick={onStartChallenge}
                    // sx={{ 
                    //   backgroundColor: 'rgb(125,133,193)', 
                    //   '&:hover': { backgroundColor: 'rgb(158, 167, 240)' }
                    // }}
                  >
                    Bấm để vẽ 
                  </Button>
                )}

              {(quest.type === "heart_challenge" ||
                quest.type === "circle_challenge" ||
                quest.type === "star_challenge") &&
                challengeStarted && (
                  <Box className="drawing-container">
                    <Typography className="quest-description">
                      Thời gian còn lại: {timeLeft} giây
                    </Typography>
                    <Typography className="quest-description">
                      {quest.type === "heart_challenge"
                        ? "Viền theo đường màu đen của trái tim nhé!"
                        : quest.type === "circle_challenge"
                        ? "Viền theo đường màu đen của hình tròn nhé!"
                        : "Viền theo đường màu đen của ngôi sao nhé!"}
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

              {(quest.type === "heart_challenge" ||
                quest.type === "circle_challenge" ||
                quest.type === "star_challenge") &&
                showResult && (
                  <Box>
                    {/* <Typography className="quest-description">
                      Outline Accuracy: {fillPercentage ? fillPercentage.toFixed(2) : 0}%
                    </Typography> */}
                    <Typography className="quest-description" sx={{ marginTop: 1, whiteSpace: 'pre-line' }}>
                      {fillPercentage >= passThreshold
                        ? quest.rewards
                        : quest.punish}
                    </Typography>
                    <canvas
                      className="drawing-container"
                      ref={finalCanvasRef}
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
                        style={{ width: "100%", maxHeight: "400px" }}
                      />
                      <Button
                        variant="contained"
                        className="action-button"
                        onClick={onTakePhoto}
                        sx={{ marginTop: 2 }}
                      >
                        Bấm để chụp
                      </Button>
                    
                      <canvas ref={photoCanvasRef} style={{ display: "none" }} />
                    </>
                  )}
                </Box>
              )}

              {quest.type === "photo" && photoTaken && photoData && (
                <Box className="photo-container">
                  <Typography className="quest-description" sx={{ whiteSpace: 'pre-line' }}>
                    Kỷ niệm đã được lưu trữ!{'\n'}{'\n'}{quest.rewards}
                  </Typography>
                  <img
                    src={photoData}
                    alt="Captured"
                    style={{ width: "100%", maxHeight: "400px", marginTop: "10px" }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default QuestCardModal;
