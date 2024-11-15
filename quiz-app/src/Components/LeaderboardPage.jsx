// src/components/LeaderboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useLocation } from 'react-router-dom';

const LeaderboardPage = () => {
  const [topScores, setTopScores] = useState([]);
  const location = useLocation();

  // Retrieve the user's latest score and email passed via location state
  const latestScore = location.state?.score;
  const latestEmail = location.state?.email;

  useEffect(() => {
    // Fetch scores from local storage
    const scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
    // Sort scores in descending order
    const sortedScores = scores.sort((a, b) => b.score - a.score);
    setTopScores(sortedScores);
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Leaderboard
        </Typography>
        <Typography variant="h6" color="primary" gutterBottom>
          Your Latest Score: {latestScore}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {latestEmail}
        </Typography>
        <List>
          {topScores.length > 0 ? (
            topScores.map((entry, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={`Rank ${index + 1}`}
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {entry.email}
                        </Typography>
                        <Typography variant="body2">
                          Score: {entry.score}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < topScores.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No scores available. Take the quiz to add your score!
            </Typography>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default LeaderboardPage;
