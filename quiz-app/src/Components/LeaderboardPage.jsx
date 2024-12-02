import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Divider, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const LeaderboardPage = () => {
  const [topScores, setTopScores] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedModule) {
      setLoading(true);
      // Filter and sort scores by the selected module
      const scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
      const filteredScores = scores
        .filter((entry) => entry.module === selectedModule)
        .sort((a, b) => b.score - a.score); // Sort by descending score
      setTopScores(filteredScores);
      setLoading(false);
    }
  }, [selectedModule]);

  const handleModuleChange = (event) => {
    setSelectedModule(event.target.value);
  };

  const addScore = (email, score, totalQuestions, module) => {
    const newEntry = {
      email,
      score,
      totalQuestions,
      module,
      date: new Date().toISOString(),
    };
    const updatedScores = [...(JSON.parse(localStorage.getItem('leaderboardScores')) || []), newEntry];
    localStorage.setItem('leaderboardScores', JSON.stringify(updatedScores));
  };

  const handleQuizCompletion = (email, score, totalQuestions, module) => {
    // Save to localStorage
    addScore(email, score, totalQuestions, module);

    // Redirect to leaderboard page, passing latest score and email
    navigate('/leaderboard', { state: { score, email } });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Leaderboard
        </Typography>
        {latestScore && latestEmail && (
          <>
            <Typography variant="h6" color="primary" gutterBottom>
              Your Latest Score: {latestScore}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {latestEmail}
            </Typography>
          </>
        )}

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

        {loading ? (
          <CircularProgress />
        ) : (
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
        )}
      </Paper>
    </Container>
  );
};

export default LeaderboardPage;
