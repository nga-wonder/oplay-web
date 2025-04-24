  import React, { useState, useEffect, useRef } from "react";
  import {
    Box,
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
  import "../css/Game1.css";

  const WS_URL = "ws://10.212.13.156:8765";

  const SettingsButton = styled(IconButton)(({ theme }) => ({
    position: "absolute",
    right: "1.5vw",
    top: "12vh",
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
    const [countdown, setCountdown] = useState(3);
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
    const isDrawing = useRef(false);
    const lastPoint = useRef(null);
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
      console.log("Number of quests:", questCards.length);
      console.log("Number quest map:", map);
      return map;
    };

    const initializeHeartCanvas = (canvas) => {
      if (!canvas) {
        console.error("Canvas is not available for initializeHeartCanvas");
        return;
      }
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log("Canvas cleared and initialized for heart_challenge");

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = 8;

      ctx.beginPath();
      for (let t = 0; t <= 2 * Math.PI; t += 0.01) {
        const x = centerX + scale * 16 * Math.pow(Math.sin(t), 3);
        const y = centerY - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        if (t === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = "black";
      ctx.lineWidth = 10;
      ctx.stroke();
    };

    const initializeCircleCanvas = (canvas) => {
      if (!canvas) {
        console.error("Canvas is not available for initializeCircleCanvas");
        return;
      }
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log("Canvas cleared and initialized for circle_challenge");

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 70;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 10;
      ctx.stroke();
    };

    const initializeStarCanvas = (canvas) => {
      if (!canvas) {
        console.error("Canvas is not available for initializeStarCanvas");
        return;
      }
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "red";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log("Canvas cleared and initialized for star_challenge");

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const outerRadius = 70;
      const innerRadius = 30;
      const points = 5;
      const angleStep = Math.PI / points;

      ctx.beginPath();
      for (let i = 0; i < 2 * points; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 10;
      ctx.stroke();
    };

    const startDrawing = (e) => {
      if (!challengeStarted) return;
      isDrawing.current = true;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      lastPoint.current = { x, y };
      console.log("Started drawing at:", { x, y });
    };

    const stopDrawing = () => {
      isDrawing.current = false;
      lastPoint.current = null;
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.beginPath();
      }
      console.log("Stopped drawing");
    };

    const draw = (e) => {
      if (!isDrawing.current || !challengeStarted) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas not available in draw function");
        return;
      }
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.strokeStyle = currentQuest?.type === "star_challenge" ? "yellow" : "red";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      if (lastPoint.current) {
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        console.log("Drew line from:", lastPoint.current, "to:", { x, y });
      }
      lastPoint.current = { x, y };
    };

    const evaluateHeartOutline = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas not available for evaluation");
        return;
      }
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let totalOutlinePixels = 0;
      let drawnOutlinePixels = 0;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = 8;
      const tolerance = 10;

      for (let t = 0; t <= 2 * Math.PI; t += 0.005) {
        const x = Math.round(centerX + scale * 16 * Math.pow(Math.sin(t), 3));
        const y = Math.round(centerY - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)));

        for (let dx = -tolerance; dx <= tolerance; dx++) {
          for (let dy = -tolerance; dy <= tolerance; dy++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance <= tolerance) {
                totalOutlinePixels++;
                const index = (py * canvas.width + px) * 4;
                if (
                  imageData[index] > 200 &&
                  imageData[index + 1] < 50 &&
                  imageData[index + 2] < 50
                ) {
                  drawnOutlinePixels++;
                }
              }
            }
          }
        }
      }

      const percentage = totalOutlinePixels > 0 ? (drawnOutlinePixels / totalOutlinePixels) * 100 : 0;
      setFillPercentage(percentage);
      setShowResult(true);
      setChallengeStarted(false);
      console.log(`Evaluated heart_challenge outline: ${percentage.toFixed(2)}%`, {
        totalOutlinePixels,
        drawnOutlinePixels,
        percentage,
      });
    };

    const evaluateCircleOutline = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas not available for evaluation");
        return;
      }
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let totalOutlinePixels = 0;
      let drawnOutlinePixels = 0;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 70;
      const tolerance = 10;

      for (let t = 0; t <= 2 * Math.PI; t += 0.005) {
        const x = Math.round(centerX + radius * Math.cos(t));
        const y = Math.round(centerY + radius * Math.sin(t));

        for (let dx = -tolerance; dx <= tolerance; dx++) {
          for (let dy = -tolerance; dy <= tolerance; dy++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance <= tolerance) {
                totalOutlinePixels++;
                const index = (py * canvas.width + px) * 4;
                if (
                  imageData[index] > 200 &&
                  imageData[index + 1] < 50 &&
                  imageData[index + 2] < 50
                ) {
                  drawnOutlinePixels++;
                }
              }
            }
          }
        }
      }

      const percentage = totalOutlinePixels > 0 ? (drawnOutlinePixels / totalOutlinePixels) * 100 : 0;
      setFillPercentage(percentage);
      setShowResult(true);
      setChallengeStarted(false);
      console.log(`Evaluated circle_challenge outline: ${percentage.toFixed(2)}%`, {
        totalOutlinePixels,
        drawnOutlinePixels,
        percentage,
      });
    };

    const evaluateStarOutline = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas not available for evaluation");
        return;
      }
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let totalOutlinePixels = 0;
      let drawnOutlinePixels = 0;
      
      const tolerance = 10
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const outerRadius = 70;
      const innerRadius = 30;
      const points = 5;
      const angleStep = Math.PI / points;
      const vertices = [];

      for (let i = 0; i < 2 * points; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * angleStep - Math.PI / 2;
        vertices.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        });
      }

      for (let i = 0; i < vertices.length; i++) {
        const start = vertices[i];
        const end = vertices[(i + 1) % vertices.length];
        const steps = 100; // Number of points to sample along each segment
        for (let t = 0; t <= 1; t += 1 / steps) {
          const x = Math.round(start.x + t * (end.x - start.x));
          const y = Math.round(start.y + t * (end.y - start.y));

          for (let dx = -tolerance; dx <= tolerance; dx++) {
            for (let dy = -tolerance; dy <= tolerance; dy++) {
              const px = x + dx;
              const py = y + dy;
              if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= tolerance) {
                  totalOutlinePixels++;
                  const index = (py * canvas.width + px) * 4;
                  if (
                    imageData[index] > 200 && // High red
                    imageData[index + 1] > 200 && // High green
                    imageData[index + 2] < 50 // Low blue
                  ) {
                    drawnOutlinePixels++;
                  }
                }
              }
            }
          }
        }
      }

      const percentage = totalOutlinePixels > 0 ? (drawnOutlinePixels / totalOutlinePixels) * 100 : 0;
      setFillPercentage(percentage);
      setShowResult(true);
      setChallengeStarted(false);
      console.log(`Evaluated star_challenge outline: ${percentage.toFixed(2)}%`, {
        totalOutlinePixels,
        drawnOutlinePixels,
        percentage,
      });
    };

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
        alert("Unable to access camera. Please check your permissions.");
      }
    };

    const takePhoto = () => {
      const video = videoRef.current;
      const canvas = photoCanvasRef.current;
      if (!video || !canvas) {
        console.error("Video or canvas missing:", { video, canvas });
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get 2D context for canvas");
        return;
      }

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
        console.log("Game started with numbers:", newNumbers);
      }
    }, [countdown, gameStarted]);

    useEffect(() => {
      if (challengeStarted && timeLeft > 0) {
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              if (currentQuest?.type === "heart_challenge") {
                evaluateHeartOutline();
              } else if (currentQuest?.type === "circle_challenge") {
                evaluateCircleOutline();
              } else if (currentQuest?.type === "star_challenge") {
                evaluateStarOutline();
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }, [challengeStarted, timeLeft, currentQuest]);

    useEffect(() => {
      if (openModal && currentQuest?.type === "photo") {
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
        console.log("Selected quest:", randomQuest);
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
      console.log("Challenge started for quest:", currentQuest);
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
        <BackButton />
        <SettingsButton onClick={handleOpenSettings}>
          <SettingsIcon fontSize="large" />
        </SettingsButton>
        <HomeButton />
        <div className="decor-cloud" />
        <Container sx={{ position: "relative", zIndex: 1, height: "100vh", width: "100vw", maxWidth: "100%" }}>
          {!gameStarted ? (
            <div className="start-screen">
              <img
                src="/assets/lettering.png"
                alt="Lettering"
                className="lettering-image"
                onLoad={() => console.log("lettering.png loaded successfully")}
                onError={() => console.error("Failed to load lettering.png")}
              />
              <h2 className="countdown">{countdown}</h2>
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
                videoRef={videoRef}
                photoCanvasRef={photoCanvasRef}
                onStartDrawing={startDrawing}
                onDraw={draw}
                onStopDrawing={stopDrawing}
                initializeHeartCanvas={initializeHeartCanvas}
                initializeCircleCanvas={initializeCircleCanvas}
                initializeStarCanvas={initializeStarCanvas}
              />
            </div>
          )}

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
        </Container>
      </div>
    );
  }

  export default Game1;