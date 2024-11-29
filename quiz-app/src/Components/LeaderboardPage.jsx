import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Divider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useLocation } from 'react-router-dom';

const LeaderboardPage = () => {
  const [topScores, setTopScores] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const location = useLocation();

  // Retrieve the user's latest score and email passed via location state
  const latestScore = location.state?.score;
  const latestEmail = location.state?.email;

  useEffect(() => {
    // Fetch scores from local storage
    const scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
    const uniqueModules = [
      ...new Set(scores.map((entry) => entry.module)),
    ]; // Extract unique module names
    setModules(uniqueModules);

    // Initially, display scores for the first module if available
    if (uniqueModules.length > 0) {
      setSelectedModule(uniqueModules[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedModule) {
      // Filter and sort scores by the selected module
      const scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
      const filteredScores = scores
        .filter((entry) => entry.module === selectedModule)
        .sort((a, b) => b.score - a.score); // Sort by descending score
      setTopScores(filteredScores);
    }
  }, [selectedModule]);

  const handleModuleChange = (event) => {
    setSelectedModule(event.target.value);
  };

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

        <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
          <InputLabel>Select Module</InputLabel>
          <Select
            value={selectedModule}
            onChange={handleModuleChange}
            label="Select Module"
          >
            {modules.map((module, index) => (
              <MenuItem key={index} value={module}>
                {module}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
                          Score: {entry.score} / {entry.totalQuestions}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(entry.date).toLocaleString()}
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
              No scores available for this module. Take the quiz to add your score!
            </Typography>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default LeaderboardPage;
