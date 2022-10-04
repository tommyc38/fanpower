import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './pages/home';
import { Game } from './pages/game';

export const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:gameId" element={<Game />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
