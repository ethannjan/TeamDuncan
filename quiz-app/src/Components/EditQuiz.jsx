import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
} from '@mui/material';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import EditQuizForm from './EditQuizForm';

const EditQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        const quizList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuizzes(quizList);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        alert('Failed to load quizzes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleBack = () => {
    setSelectedQuizId(null);
  };

  if (selectedQuizId) {
    return <EditQuizForm selectedQuizId={selectedQuizId} onBack={handleBack} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Edit Quiz
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Select a quiz to edit:
      </Typography>
      {isLoading ? (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading quizzes...
          </Typography>
        </Box>
      ) : quizzes.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 5 }}>
          No quizzes available to edit.
        </Typography>
      ) : (
        <List>
          {quizzes.map((quiz) => (
            <Paper key={quiz.id} sx={{ mb: 2, p: 2 }}>
              <ListItem
                button
                onClick={() => setSelectedQuizId(quiz.id)}
                sx={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <ListItemText
                  primary={quiz.quizName}
                  secondary={`Subject: ${quiz.subject}`}
                />
                <Button variant="outlined" size="small">
                  Edit
                </Button>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default EditQuiz;
