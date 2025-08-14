import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import EstadoPage from './components/EstadoPage';
import Ranking from './components/Ranking'
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Ranking />} />
          <Route path="/:siglaEstado" element={<EstadoPage />} />
          <Route path="/estatisticas" element={<HomePage />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;