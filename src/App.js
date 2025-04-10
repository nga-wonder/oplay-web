import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Games from "./pages/Games";
import Game1 from "./pages/Game1";
import Game2 from "./pages/Game2";
import Game3 from "./pages/Game3";
import Game4 from "./pages/Game4";
import Play1 from "./pages/Play1";
import Play2 from "./pages/Play2";
import Play3 from "./pages/Play3";
import Play4 from "./pages/Play4";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<Games />} />
        <Route path="/game1" element={<Game1 />} />
        <Route path="/game2" element={<Game2 />} />
        <Route path="/game3" element={<Game3 />} />
        <Route path="/game4" element={<Game4 />} />
        <Route path="/play1" element={<Play1 />} />
        <Route path="/play2" element={<Play2 />} />
        <Route path="/play3" element={<Play3 />} />
        <Route path="/play4" element={<Play4 />} />
      </Routes>
    </Router>
  );
}

export default App;
