import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Container,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import HomeButton from "../components/HomeButton";
import BackButton from "../components/BackButton";
import QuestCardModal from "../components/QuestCardModal";
import questCards from "../data/QuestCard.json";
import boardImage from "../assets/WEB_game1_board.png";
import SettingsIcon from "@mui/icons-material/Settings";
import "../css/PotatoMine.css";
import "../css/Game1.css";

const WS_URL = "ws://10.212.13.156:8765";

const SettingsButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: "20px",
  top: "20px",
  color: "#FFD700",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(5px)",
  borderRadius: "50%",
  padding: "10px",
  zIndex: 2,
  "&:hover": {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    transform: "scale(1.2)",
  },
}));

const VolumeSlider = styled(Slider)(({ theme }) => ({
  color: "#FF8C00",
  "& .MuiSlider-thumb": {
    backgroundColor: "#FFD700",
    "&:hover": {
      boxShadow: "0 0 0 8px rgba(255, 215, 0, 0.16)",
    },
  },
  "& .MuiSlider-rail": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  "& .MuiSlider-track": {
    background: "linear-gradient(90deg, #FF8C00, #FFD700)",
  },
}));

const ColorPicker = styled("input")(({ theme }) => ({
  type: "color",
  width: "60px",
  height: "60px",
  border: "2px solid #FF8C00",
  borderRadius: "10px",
  padding: "5px",
  cursor: "pointer",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  "&:hover": {
    borderColor: "#FFD700",
    transform: "scale(1.1)",
  },
}));

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
  const [sensorIds, setSensorIds] = useState([]);
  const [receivedInteger, setReceivedInteger] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [volume, setVolume] = useState(50);
  const [color, setColor] = useState("#FF8C00");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const photoCanvasRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;

  useEffect(() => {
    console.log("Game state:", { countdown, gameStarted });
  }, [countdown, gameStarted]);

  useEffect(() => {
    let reconnectTimeout;

    const connectWebSocket = () => {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const sensorId = parseInt(event.data, 10);
          if (!isNaN(sensorId)) {
            setReceivedInteger(sensorId);
            setSensorIds((prev) => {
              if (!prev.includes(sensorId) && sensorId >= 0 && sensorId <= 47) {
                return [...prev, sensorId].sort((a, b) => a - b);
              }
              return prev;
            });
            if (randomNumbers.includes(sensorId + 1)) {
              setInputNumber((sensorId + 1).toString());
              handleInputChange({ target: { value: (sensorId + 1).toString() } });
            }
            console.log(`Received sensor ID: ${sensorId}`);
          } else {
            console.warn("Received non-integer data:", event.data);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          reconnectTimeout = setTimeout(connectWebSocket, reconnectInterval);
        } else {
          console.error("Max reconnection attempts reached. Please check the server.");
        }
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [randomNumbers]);

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

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        "Camera access is not supported in this browser. Please ensure you're using HTTPS or localhost, or try a different browser."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        alert(
          "Camera access was denied. Please enable camera access in Settings > Privacy & Security > Camera for this app or browser."
        );
      } else if (err.name === "NotFoundError") {
        alert("No camera found on this device.");
      } else {
        alert("An error occurred while accessing the camera: " + err.message);
      }
    }
  };

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

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleAnswer = (answerId) => {
    const number = parseInt(inputNumber);
    let isCorrect = false;

    if (currentQuest && currentQuest.validator) {
      try {
        const validatorFunc = new Function('number', `return (${currentQuest.validator})(number);`);
        isCorrect = validatorFunc(number) && answerId === 1;
      } catch (error) {
        console.error("Error executing validator:", error);
        isCorrect = false;
      }
    }

    setFillPercentage(isCorrect ? 100 : 0);
    setShowResult(true);
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
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };
  }, [cameraStream]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputNumber(value);

    if (value && randomNumbers.includes(parseInt(value))) {
      const matchedNumber = parseInt(value);
      const questsForNumber = numberQuestMap[matchedNumber];
      const randomQuest =
        questsForNumber[Math.floor(Math.random() * questsForNumber.length)];
      setCurrentQuest(randomQuest);
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

  const clearSensors = () => {
    setSensorIds([]);
  };

  const handleOpenSettings = () => {
    setOpenSettings(true);
  };

  const handleCloseSettings = () => {
    setOpenSettings(false);
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
  };

  const handleColorChange = (event) => {
    setColor(event.target.value);
  };

  return (
    <div className="game1-background">
      <div className="decor-cloud" />
      <Container sx={{ position: "relative", zIndex: 1, height: "100vh" }}>
        <BackButton />
        <SettingsButton onClick={handleOpenSettings}>
          <SettingsIcon fontSize="large" />
        </SettingsButton>
        <HomeButton />
        <h1>Game 1 Page</h1>

        {!gameStarted ? (
          <div>
            <div className="potato-mine">
              <div className="eye1" />
              <div className="eye2" />
            </div>
            <h2>Game starting in: {countdown}</h2>
          </div>
        ) : (
          <div>
            <img
              src={boardImage}
              alt="Game Board"
              className="game1-board"
              onLoad={() => console.log("WEB_game1_board.png loaded successfully")}
              onError={() => console.error("Failed to load WEB_game1_board.png")}
            />
            <div className="floating-cloud" />
            <div className="floating-cloud-opposite" />
            <div className="floating-cloud-third" />
            <h2>Game has started!</h2>
            <Typography sx={{ marginTop: 2 }}>
              Generated numbers: {randomNumbers.join(", ")}
            </Typography>
            <Typography sx={{ marginTop: 2 }}>
              Latest Received Integer: {receivedInteger !== null ? receivedInteger : "Waiting for data..."}
            </Typography>
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="h6">Active Chessboard Sensors</Typography>
              {sensorIds.length > 0 ? (
                <List dense>
                  {sensorIds.map((id) => (
                    <ListItem key={id}>
                      <ListItemText
                        primary={`Sensor ID: ${id} (Square ${id + 1})`}
                        primaryTypographyProps={{
                          color: randomNumbers.includes(id + 1) ? "primary" : "textPrimary",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">
                  No sensors active
                </Typography>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={clearSensors}
                sx={{ marginTop: 1 }}
              >
                Clear Sensors
              </Button>
            </Box>

            <TextField
              label="Enter a number (1-48)"
              type="number"
              value={inputNumber}
              onChange={handleInputChange}
              inputProps={{ min: 1, max: 48 }}
              sx={{ marginTop: 2 }}
            />

            <QuestCardModal
              open={openModal}
              onClose={handleCloseModal}
              quest={currentQuest}
              inputNumber={inputNumber}
              onStartChallenge={startChallenge}
              challengeStarted={challengeStarted}
              timeLeft={timeLeft}
              canvasRef={canvasRef}
              showResult={showResult}
              fillPercentage={fillPercentage}
              photoTaken={photoTaken}
              photoData={photoData}
              cameraStream={cameraStream}
              onStartCamera={startCamera}
              onTakePhoto={takePhoto}
              onAnswer={handleAnswer}
              videoRef={videoRef}
              photoCanvasRef={photoCanvasRef}
            />

            <Dialog open={openSettings} onClose={handleCloseSettings}>
              <DialogTitle>Settings</DialogTitle>
              <DialogContent>
                <Typography gutterBottom>Adjust game settings here.</Typography>
                <Typography gutterBottom>Volume</Typography>
                <VolumeSlider
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-labelledby="volume-slider"
                  min={0}
                  max={100}
                  sx={{ width: "200px" }}
                />
                <Typography>Volume: {volume}%</Typography>
                <Typography gutterBottom sx={{ marginTop: 2 }}>
                  Theme Color
                </Typography>
                <ColorPicker
                  type="color"
                  value={color}
                  onChange={handleColorChange}
                />
                <Typography>Selected Color: {color}</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseSettings} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )}
      </Container>
    </div>
  );
}

export default Game1;