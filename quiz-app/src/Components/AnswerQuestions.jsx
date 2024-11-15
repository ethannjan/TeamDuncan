// src/components/AnswerQuestions.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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
  Divider,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import { useNavigate } from 'react-router-dom';

const AnswerQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Retrieve the authenticated user's email
  const auth = getAuth();
  const user = auth.currentUser;
  const userEmail = user ? user.email : "Guest";  // Default to "Guest" if not logged in

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsCollection = collection(db, 'questions');
        const querySnapshot = await getDocs(questionsCollection);
        setQuestions(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
      } catch (err) {
        console.error("Failed to load questions:", err);
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

    // Save the email and score to local storage for the leaderboard
    const scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
    scores.push({ email: userEmail, score: calculatedScore });
    localStorage.setItem('leaderboardScores', JSON.stringify(scores));

    // Redirect to LeaderboardPage and pass the score
    navigate('/leaderboard', { state: { score: calculatedScore, email: userEmail } });
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
      </Paper>
    </Container>
  );
};

export default AnswerQuestions;
