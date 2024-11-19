import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import EditQuizForm from './EditQuizForm'; // Separate component for editing a specific quiz

const EditQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        const quizList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuizzes(quizList);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      }
    };

    fetchQuizzes();
  }, []);

  if (selectedQuizId) {
    return <EditQuizForm selectedQuizId={selectedQuizId} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Edit Quiz
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Select a quiz to edit:
      </Typography>
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
    </Box>
  );
};

export default EditQuiz;
