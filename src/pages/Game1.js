import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Modal,
  Box,
  Typography,
  Button,
} from "@mui/material";
import HomeButton from "../components/HomeButton";
import NavBar from "../components/NavBar";
import questCards from "../data/QuestCard.json";
import styled from "@emotion/styled";

// Styled component for the Potato Mine
const PotatoMine = styled.div`
  width: 120px;
  height: 80px;
  background-color: #d2b48c;
  border-radius: 40% 40% 20% 20%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: blob 1.5s infinite ease-in-out;

  &::before {
    content: "";
    position: absolute;
    width: 10px;
    height: 20px;
    background-color: #228b22;
    top: -15px;
    left: 30px;
    border-radius: 5px;
  }

  &::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 15px;
    background-color: #228b22;
    top: -10px;
    left: 80px;
    border-radius: 5px;
  }

  .eye1 {
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: white;
    border-radius: 50%;
    top: 25px;
    left: 35px;
  }

  .eye2 {
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: white;
    border-radius: 50%;
    top: 25px;
    left: 70px;
  }

  @keyframes blob {
    0% {
      transform: translate(-50%, -50%) scale(1, 1);
    }
    25% {
      transform: translate(-50%, -50%) scale(1.1, 0.9);
    }
    50% {
      transform: translate(-50%, -50%) scale(0.9, 1.2);
    }
    75% {
      transform: translate(-50%, -50%) scale(1.05, 0.95);
    }
    100% {
      transform: translate(-50%, -50%) scale(1, 1);
    }
  }
`;

function Game1() {
  const [countdown, setCountdown] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [randomNumbers, setRandomNumbers] = useState([]);
  const [inputNumber, setInputNumber] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [currentQuest, setCurrentQuest] = useState(null);
  const [numberQuestMap, setNumberQuestMap] = useState({});
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [fillPercentage, setFillPercentage] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const photoCanvasRef = useRef(null);
  const isDrawing = useRef(false);

  const generateRandomNumbers = () => {
    const numbers = new Set();
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 48) + 1);
    }
    return Array.from(numbers);
  };

  const assignQuestsToNumbers = (numbers) => {
    const map = {};
    const shuffledQuests = [...questCards].sort(() => Math.random() - 0.5);
    numbers.forEach((number, index) => {
      const startIdx = index * 6;
      map[number] = shuffledQuests.slice(startIdx, startIdx + 6);
    });
    return map;
  };

  // Initialize canvas for challenge
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    const points = 10;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const variation = Math.random() * 20 - 10;
      const x = centerX + (radius + variation) * Math.cos(angle);
      const y = centerY + (radius + variation) * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Start painting
  const startDrawing = (e) => {
    if (!challengeStarted) return;
    isDrawing.current = true;
    draw(e);
  };

  // Stop painting
  const stopDrawing = () => {
    isDrawing.current = false;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
  };

  // Draw on canvas
  const draw = (e) => {
    if (!isDrawing.current || !challengeStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  // Evaluate fill percentage
  const evaluateFill = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let totalPixels = 0;
    let filledPixels = 0;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    for (let x = 50; x < canvas.width - 50; x++) {
      for (let y = 50; y < canvas.height - 50; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        if (dx * dx + dy * dy <= radius * radius) {
          const index = (y * canvas.width + x) * 4;
          totalPixels++;
          if (imageData[index] === 255 && imageData[index + 1] === 0) {
            filledPixels++;
          }
        }
      }
    }

    const percentage = totalPixels > 0 ? (filledPixels / totalPixels) * 100 : 0;
    setFillPercentage(percentage);
    setShowResult(true);
    setChallengeStarted(false);
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please ensure permissions are granted.");
    }
  };

  // Take photo
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = photoCanvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    setPhotoData(dataUrl);
    setPhotoTaken(true);

    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0 && !gameStarted) {
      const newNumbers = generateRandomNumbers();
      setRandomNumbers(newNumbers);
      setNumberQuestMap(assignQuestsToNumbers(newNumbers));
      setGameStarted(true);
    }
  }, [countdown, gameStarted]);

  useEffect(() => {
    if (challengeStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            evaluateFill();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [challengeStarted, timeLeft]);

  useEffect(() => {
    if (openModal && currentQuest?.type === "challenge") {
      initializeCanvas();
    } else if (openModal && currentQuest?.type === "photo") {
      startCamera();
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
    };
  }, [openModal, currentQuest]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputNumber(value);

    if (value && randomNumbers.includes(parseInt(value))) {
      const matchedNumber = parseInt(value);
      const questsForNumber = numberQuestMap[matchedNumber];
      const randomQuest =
        questsForNumber[Math.floor(Math.random() * questsForNumber.length)];
      setCurrentQuest(randomQuest);
      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setInputNumber("");
    setCurrentQuest(null);
    setChallengeStarted(false);
    setTimeLeft(20);
    setFillPercentage(null);
    setShowResult(false);
    setPhotoTaken(false);
    setPhotoData(null);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const startChallenge = () => {
    setChallengeStarted(true);
    setTimeLeft(20);
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Container sx={{ position: "relative", height: "100vh" }}>
      <NavBar />
      <HomeButton />
      <h1>Game 1 Page</h1>

      <PotatoMine>
        <div className="eye1" />
        <div className="eye2" />
      </PotatoMine>

      {!gameStarted ? (
        <div>
          <h2>Game starting in: {countdown}</h2>
        </div>
      ) : (
        <div>
          <h2>Game has started!</h2>
          <p>Generated numbers: {randomNumbers.join(", ")}</p>

          <TextField
            label="Enter a number (1-48)"
            type="number"
            value={inputNumber}
            onChange={handleInputChange}
            inputProps={{ min: 1, max: 48 }}
            sx={{ marginTop: 2 }}
          />

          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="quest-modal-title"
            aria-describedby="quest-modal-description"
          >
            <Box sx={modalStyle}>
              {currentQuest && !showResult && !photoTaken ? (
                <>
                  <Typography
                    id="quest-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    {currentQuest.title}
                  </Typography>
                  {currentQuest.type === "questionnaire" ? (
                    <>
                      <Typography id="quest-modal-description" sx={{ mt: 2 }}>
                        {currentQuest.description}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>
                        Difficulty: {currentQuest.difficulty}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>
                        Number matched: {inputNumber}
                      </Typography>
                    </>
                  ) : currentQuest.type === "challenge" ? (
                    <Box sx={{ mt: 2 }}>
                      <Typography>{currentQuest.description}</Typography>
                      <Typography>Difficulty: {currentQuest.difficulty}</Typography>
                      {challengeStarted ? (
                        <>
                          <Typography sx={{ mt: 1 }}>
                            Time left: {timeLeft}s
                          </Typography>
                          <canvas
                            ref={canvasRef}
                            width={300}
                            height={300}
                            style={{ border: "1px solid black", marginTop: "10px" }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                          />
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={startChallenge}
                          sx={{ mt: 2 }}
                        >
                          Start Challenge
                        </Button>
                      )}
                    </Box>
                  ) : currentQuest.type === "photo" ? (
                    <Box sx={{ mt: 2 }}>
                      <Typography>{currentQuest.description}</Typography>
                      <Typography>Difficulty: {currentQuest.difficulty}</Typography>
                      <video
                        ref={videoRef}
                        autoPlay
                        style={{ width: "100%", marginTop: "10px" }}
                      />
                      <Button
                        variant="contained"
                        onClick={takePhoto}
                        sx={{ mt: 2 }}
                      >
                        Take Photo
                      </Button>
                      <canvas ref={photoCanvasRef} style={{ display: "none" }} />
                    </Box>
                  ) : null}
                </>
              ) : currentQuest && showResult ? (
                <>
                  <Typography variant="h6" component="h2">
                    Challenge Result
                  </Typography>
                  <Typography sx={{ mt: 2 }}>
                    Fill Percentage: {fillPercentage.toFixed(2)}%
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    {fillPercentage >= currentQuest.passThreshold
                      ? "Congratulations! You passed!"
                      : "Sorry, you didn't fill enough. Try again!"}
                  </Typography>
                </>
              ) : currentQuest && photoTaken ? (
                <>
                  <Typography variant="h6" component="h2">
                    Photo Captured!
                  </Typography>
                  <Typography sx={{ mt: 2 }}>
                    Great job! Here's your selfie:
                  </Typography>
                  {photoData && (
                    <img
                      src={photoData}
                      alt="Captured selfie"
                      style={{ width: "100%", marginTop: "10px" }}
                    />
                  )}
                </>
              ) : null}
            </Box>
          </Modal>
        </div>
      )}
    </Container>
  );
}

export default Game1;