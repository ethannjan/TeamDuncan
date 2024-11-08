import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Signup from './Components/Signup';
import Quiz from './Components/Quiz';
import Login from './Components/Login';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path = "/login" element={<Login/>}/>
      </Routes>
    </Router>
  );
};

export default App;
