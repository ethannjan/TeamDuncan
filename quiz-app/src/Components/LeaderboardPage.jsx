import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const LeaderboardPage = () => {
  const [topScores, setTopScores] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const latestScore = location.state?.score;
  const latestEmail = location.state?.email;

  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
    const uniqueModules = [...new Set(scores.map((entry) => entry.module))];
    setModules(uniqueModules);

    // Automatically select the module passed via state or default to the first available module
    if (location.state?.module) {
      setSelectedModule(location.state.module);
    } else if (uniqueModules.length > 0) {
      setSelectedModule(uniqueModules[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedModule) {
      const scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
      const filteredScores = scores
        .filter((entry) => entry.module === selectedModule)
        .sort((a, b) => b.score - a.score);
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

        {/* Show dropdown only if no module is pre-selected */}
        {!location.state?.module && (
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
        )}

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

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(-1)} // Navigate back to the previous page
          >
            Take Another Quiz
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LeaderboardPage;
