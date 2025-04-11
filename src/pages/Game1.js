import React, { useState, useEffect } from "react";
import { Container, TextField, Modal, Box, Typography } from "@mui/material";
import HomeButton from "../components/HomeButton";
import NavBar from "../components/NavBar";
import questCards from "../data/QuestCard.json";
import styled from "@emotion/styled";

// Styled component for the Potato Mine
const PotatoMine = styled.div`
  width: 120px;
  height: 80px;
  background-color: #D2B48C; // Light brown potato color
  border-radius: 40% 40% 20% 20%; // Irregular potato shape
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: blob 1.5s infinite ease-in-out;
  
  // Sprouts (like Potato Mine)
  &::before {
    content: '';
    position: absolute;
    width: 10px;
    height: 20px;
    background-color: #228B22; // Green sprout
    top: -15px;
    left: 30px;
    border-radius: 5px;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 15px;
    background-color: #228B22;
    top: -10px;
    left: 80px;
    border-radius: 5px;
  }

  // Eyes
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
      transform: translate(-50%, -50%) scale(1.1, 0.9); // Stretch horizontally
    }
    50% {
      transform: translate(-50%, -50%) scale(0.9, 1.2); // Stretch vertically
    }
    75% {
      transform: translate(-50%, -50%) scale(1.05, 0.95); // Slight wobble
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

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputNumber(value);
    
    if (value && randomNumbers.includes(parseInt(value))) {
      const matchedNumber = parseInt(value);
      const questsForNumber = numberQuestMap[matchedNumber];
      const randomQuest = questsForNumber[Math.floor(Math.random() * questsForNumber.length)];
      setCurrentQuest(randomQuest);
      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setInputNumber("");
    setCurrentQuest(null);
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Container sx={{ position: 'relative', height: '100vh' }}>
      <NavBar />
      <HomeButton />
      <h1>Game 1 Page</h1>
      
      {/* Potato Mine with animation */}
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
              {currentQuest && (
                <>
                  <Typography id="quest-modal-title" variant="h6" component="h2">
                    {currentQuest.title}
                  </Typography>
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
              )}
            </Box>
          </Modal>
        </div>
      )}
    </Container>
  );
}

export default Game1;