// src/components/StudentDashboard.jsx
import React from 'react';
import { Paper, Typography, Button, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();

  // Placeholder student data
  const studentName = 'John Doe';
  const studentEmail = 'johndoe@example.com';
  const studentScore = 5; // Example score from previous quiz

  // Function to navigate to the QuizAndLeaderboardPage
  const handleStartQuiz = () => {
    navigate('/quiz-and-leaderboard');  // Assuming this is your quiz page route
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* Student Info */}
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Student Dashboard</Typography>
            <Typography variant="h6" gutterBottom>Name: {studentName}</Typography>
            <Typography variant="body1" gutterBottom>Email: {studentEmail}</Typography>
            <Typography variant="body1" gutterBottom>Latest Quiz Score: {studentScore}</Typography>
          </Paper>
        </Grid>

        {/* Quiz Navigation */}
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Available Actions</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartQuiz}
              sx={{ mt: 2 }}
            >
              Start a New Quiz
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
