import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/Dashboard" element={<KanbanBoard />} />

      </Routes>
    </Router>
  );
}

export default App;
