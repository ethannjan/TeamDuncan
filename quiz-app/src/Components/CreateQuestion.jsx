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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const CreateQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ questionText: '', options: ['', '', '', ''], answer: '' });
  const [error, setError] = useState('');

  const questionsCollection = collection(db, 'questions');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(questionsCollection);
        setQuestions(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []);

  const addQuestion = async () => {
    if (newQuestion.questionText.trim() === '') {
      setError('Please enter a question text');
      return;
    }
    if (newQuestion.options.some(option => option.trim() === '')) {
      setError('Please fill in all options');
      return;
    }
    if (isNaN(newQuestion.answer) || newQuestion.answer < 0 || newQuestion.answer >= newQuestion.options.length) {
      setError('Please enter a valid answer index');
      return;
    }

    try {
      await addDoc(questionsCollection, newQuestion);
      setNewQuestion({ questionText: '', options: ['', '', '', ''], answer: '' });
      setError('');
    } catch (error) {
      console.error('Error adding question:', error);
      setError('Failed to add question. Please try again.');
    }
  };

  const updateQuestion = async (id, updatedQuestion) => {
    try {
      const questionDoc = doc(db, 'questions', id);
      await updateDoc(questionDoc, updatedQuestion);
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      const questionDoc = doc(db, 'questions', id);
      await deleteDoc(questionDoc);
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create Question
        </Typography>

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

          <Grid item xs={12} md={6}>
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

      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Existing Questions
        </Typography>

        {questions.map((q) => (
          <Paper key={q.id} elevation={2} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={8}>
                <Typography variant="body1">{q.questionText}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => updateQuestion(q.id, q)}
                >
                  Update
                </Button>
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  color="error"
                  onClick={() => deleteQuestion(q.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Paper>
    </Container>
  );
};

export default CreateQuestion;