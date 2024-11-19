import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TimerIcon from '@mui/icons-material/Timer';

const CreateQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    answer: '',
  });
  const [quizTime, setQuizTime] = useState(''); // Time in minutes
  const [error, setError] = useState('');
  const [currentEdit, setCurrentEdit] = useState(null);

  const questionsCollection = collection(db, 'questions');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(questionsCollection);
        setQuestions(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to fetch questions');
      }
    };
    fetchQuestions();
  }, []);

  const addQuestion = async () => {
    if (newQuestion.questionText.trim() === '') {
      setError('Please enter a question text');
      return;
    }
    if (newQuestion.options.some((option) => option.trim() === '')) {
      setError('Please fill in all options');
      return;
    }
    if (isNaN(newQuestion.answer) || newQuestion.answer < 0 || newQuestion.answer >= newQuestion.options.length) {
      setError('Please enter a valid answer index');
      return;
    }

    try {
      const docRef = await addDoc(questionsCollection, {
        ...newQuestion,
        timeLimit: quizTime ? parseInt(quizTime) : null // Store time limit with question
      });
      
      setQuestions([...questions, { ...newQuestion, id: docRef.id }]);
      setNewQuestion({ questionText: '', options: ['', '', '', ''], answer: '' });
      setError('');
    } catch (error) {
      console.error('Error adding question:', error);
      setError('Failed to add question. Please try again.');
    }
  };

  const saveQuizTime = async () => {
    if (!quizTime || isNaN(quizTime) || parseInt(quizTime) <= 0) {
      setError('Please enter a valid time in minutes');
      return;
    }

    try {
      // Update all questions with the quiz time
      const updatePromises = questions.map(question => {
        const questionDoc = doc(db, 'questions', question.id);
        return updateDoc(questionDoc, { timeLimit: parseInt(quizTime) });
      });

      await Promise.all(updatePromises);
      setError('');
      // Show success message
      alert(`Quiz time limit set to ${quizTime} minutes`);
    } catch (error) {
      console.error('Error saving quiz time:', error);
      setError('Failed to save quiz time. Please try again.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create Question
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Question Text"
              variant="outlined"
              fullWidth
              value={newQuestion.questionText}
              onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
            />
          </Grid>

          {newQuestion.options.map((option, index) => (
            <Grid item xs={12} md={6} key={index}>
              <TextField
                label={`Option ${index + 1}`}
                variant="outlined"
                fullWidth
                value={option}
                onChange={(e) => {
                  const updatedOptions = [...newQuestion.options];
                  updatedOptions[index] = e.target.value;
                  setNewQuestion({ ...newQuestion, options: updatedOptions });
                }}
              />
            </Grid>
          ))}

          <Grid item xs={12} md={6}>
            <TextField
              label="Answer (index of correct option)"
              variant="outlined"
              fullWidth
              value={newQuestion.answer}
              onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={addQuestion}
            >
              Add Question
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Timer Setting Section */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimerIcon /> Set Quiz Timer
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              label="Quiz Time (minutes)"
              type="number"
              variant="outlined"
              fullWidth
              value={quizTime}
              onChange={(e) => setQuizTime(e.target.value)}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveQuizTime}
              startIcon={<TimerIcon />}
            >
              Set Quiz Time
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={4000}
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default CreateQuestion;