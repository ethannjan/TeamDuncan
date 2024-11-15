// src/components/Leaderboard.jsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const Leaderboard = () => {
  const [topScores, setTopScores] = useState([]);

  useEffect(() => {
    // Fetch scores from local storage
    const scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
    // Sort scores in descending order and take the top 5
    const sortedScores = scores.sort((a, b) => b - a).slice(0, 5);
    setTopScores(sortedScores);
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Leaderboard
        </Typography>
        <List>
          {topScores.length > 0 ? (
            topScores.map((score, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText primary={`Rank ${index + 1}`} secondary={`Score: ${score}`} />
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

export default Leaderboard;
