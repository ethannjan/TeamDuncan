import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box
} from '@mui/material';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { useLocation } from 'react-router-dom';

const LeaderboardPage = () => {
  const [moduleScores, setModuleScores] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Retrieve module info passed through state or from URL
    const moduleData = location.state || {};
    const { moduleName, moduleId } = moduleData;

    // Retrieve all leaderboard scores from localStorage
    const storedScores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
    
    // Filter scores for the specific module
    const filteredScores = storedScores.filter(score => 
      score.module === moduleName
    );

    // Sort scores in descending order
    const sortedScores = filteredScores.sort((a, b) => {
      return b.score - a.score;
    });

    setModuleScores(sortedScores);
    setModuleInfo({ moduleName, moduleId });
  }, [location.state]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <LeaderboardIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4">
            {moduleInfo?.moduleName || 'Module'} Leaderboard
          </Typography>
        </Box>

        {moduleScores.length === 0 ? (
          <Typography variant="body1" align="center">
            No scores for this module yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {moduleScores.map((entry, index) => (
                  <TableRow 
                    key={index} 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: index === 0 ? '#f0f4f8' : 'transparent'
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell align="right">
                      {entry.score} / {entry.totalQuestions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default LeaderboardPage;