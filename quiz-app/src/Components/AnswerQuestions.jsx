import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import {
  Container,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';

const AnswerQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsCollection = collection(db, 'questions');
        const querySnapshot = await getDocs(questionsCollection);
        setQuestions(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
      } catch (err) {
        setError('Failed to load questions. Please try again later.');
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    questions.forEach((q) => {
      if (answers[q.id] === parseInt(q.answer, 10)) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
  };

  const isAllAnswered = questions.length > 0 && 
    questions.every(q => answers[q.id] !== undefined);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography variant="h6" align="center" sx={{ mt: 2 }}>
          Loading questions...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <QuizIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Quiz Time
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        {questions.map((q, questionIndex) => (
          <Card key={q.id} sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Question {questionIndex + 1}:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {q.questionText}
              </Typography>
              
              <RadioGroup
                value={answers[q.id] ?? ''}
                onChange={(e) => handleAnswerChange(q.id, parseInt(e.target.value, 10))}
              >
                {q.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={option}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!isAllAnswered}
            sx={{ minWidth: 200 }}
          >
            Submit Quiz
          </Button>
        </Box>

        {score !== null && (
          <Box sx={{ mt: 4 }}>
            <Alert 
              severity={score === questions.length ? "success" : "info"}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">
                Your Score: {score} / {questions.length}
              </Typography>
              <Typography variant="body2">
                {score === questions.length 
                  ? "Perfect score! Excellent work!" 
                  : "Keep practicing to improve your score!"}
              </Typography>
            </Alert>
            <LinearProgress 
              variant="determinate" 
              value={(score / questions.length) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AnswerQuestions;