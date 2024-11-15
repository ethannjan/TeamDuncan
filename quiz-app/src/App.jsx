import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './Components/Signup';
import Quiz from './Components/Quiz';
import Login from './Components/Login';
import CreateQuestion from './Components/CreateQuestion';
import AnswerQuestions from './Components/AnswerQuestions';
import LeaderboardPage from './Components/LeaderboardPage'; // Import LeaderboardPage

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/create-question" element={<CreateQuestion />} />
        <Route path="/answer-questions" element={<AnswerQuestions />} /> {/* Route for answering questions */}
        <Route path="/leaderboard" element={<LeaderboardPage />} /> {/* New route for the leaderboard */}
      </Routes>
    </Router>
  );
};

export default App;
