import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Radio,
  Checkbox,
  FormControl,
  FormControlLabel,
  RadioGroup,
} from '@mui/material';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0); // Start time at 0 for stopwatch

  const navigate = useNavigate();

  // Fetch quizzes from Firestore
  useEffect(() => {
    const fetchQuizzes = async () => {
      const querySnapshot = await getDocs(collection(db, 'quizzes'));
      const quizData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuizzes(quizData);
    };

    fetchQuizzes();
  }, []);

  // Stopwatch effect
  useEffect(() => {
    if (result || lock) return;

    const stopwatch = setInterval(() => {
      setTimeSpent((prevTime) => prevTime + 1); // Increment the time by 1 second
    }, 1000);

    return () => clearInterval(stopwatch); // Cleanup the interval when component unmounts or dependencies change
  }, [lock, result]); // Only watch for `lock` and `result` changes

  // Start selected quiz
  const startQuiz = (quiz) => {
    if (!quiz.questions || quiz.questions.length === 0) {
      alert('This quiz has no questions.');
      return;
    }
    setSelectedQuiz(quiz);
    setIndex(0);
    setQuestion(quiz.questions[0]);
    setTimeSpent(0); // Reset stopwatch when quiz starts
    setScore(0);
  };

  const handleAnswerChange = (e, optionIndex) => {
    if (question.type === 'multipleChoiceMultiple') {
      const updatedAnswers = selectedAnswer.includes(optionIndex)
        ? selectedAnswer.filter((idx) => idx !== optionIndex)
        : [...selectedAnswer, optionIndex];
      setSelectedAnswer(updatedAnswers);
    } else {
      setSelectedAnswer(e.target.value);
    }
  };

  const checkAnswer = () => {
    if (!lock) {
      let isCorrect = false;
      if (question.type === 'multipleChoiceMultiple') {
        const correctAnswers = question.answer.sort();
        const userAnswers = selectedAnswer.sort();
        isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
      } else {
        isCorrect = question.answer.toString() === selectedAnswer.toString();
      }

      if (isCorrect) setScore((prevScore) => prevScore + 1);
      setLock(true);
    }
  };

  const next = () => {
    if (lock || timeSpent === 0) {
      if (index === selectedQuiz.questions.length - 1) {
        setResult(true);
        return;
      }
      setIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        setQuestion(selectedQuiz.questions[nextIndex]);
        setTimeSpent(0); // Reset stopwatch for next question
        setSelectedAnswer('');
        setLock(false);
        return nextIndex;
      });
    }
  };

  const reset = () => {
    setSelectedQuiz(null);
    setIndex(0);
    setQuestion(null);
    setScore(0);
    setLock(false);
    setResult(false);
    setTimeSpent(0); // Reset stopwatch when quiz is reset
    setSelectedAnswer('');
  };

  if (!selectedQuiz) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom>Select a Quiz</Typography>
        {quizzes.map((quiz) => (
          <Button
            key={quiz.id}
            variant="contained"
            sx={{ mt: 2, width: '100%' }}
            onClick={() => startQuiz(quiz)}
          >
            {quiz.quizName} - {quiz.subject}
          </Button>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 4, width: '100%', mb: 3 }}>
        <Typography variant="h4" gutterBottom>{selectedQuiz.quizName}</Typography>

        {result ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5">You scored {score} out of {selectedQuiz.questions.length}</Typography>
            <Button variant="contained" onClick={reset} sx={{ mt: 2 }}>
              Reset Quiz
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>{index + 1}. {question.questionText}</Typography>

            {question.type === 'multipleChoice' || question.type === 'multipleChoiceMultiple' ? (
              <FormControl component="fieldset">
                {question.options.map((option, optIndex) => (
                  <FormControlLabel
                    key={optIndex}
                    control={
                      question.type === 'multipleChoiceMultiple' ? (
                        <Checkbox
                          checked={selectedAnswer.includes(optIndex)}
                          onChange={(e) => handleAnswerChange(e, optIndex)}
                        />
                      ) : (
                        <Radio
                          checked={selectedAnswer.toString() === optIndex.toString()}
                          onChange={() => setSelectedAnswer(optIndex.toString())}
                        />
                      )
                    }
                    label={option}
                  />
                ))}
              </FormControl>
            ) : question.type === 'trueFalse' ? (
              <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
                <FormControlLabel value="true" control={<Radio />} label="True" />
                <FormControlLabel value="false" control={<Radio />} label="False" />
              </RadioGroup>
            ) : question.type === 'identification' ? (
              <TextField
                label="Your Answer"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                fullWidth
                margin="normal"
              />
            ) : null}

            <Button variant="contained" onClick={checkAnswer} sx={{ mt: 3 }}>Submit Answer</Button>
            <Button variant="contained" onClick={next} sx={{ mt: 3, ml: 2 }} disabled={!lock}>Next</Button>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">{index + 1} of {selectedQuiz.questions.length} questions</Typography>
              <Typography variant="body2">Time Spent: {timeSpent} seconds</Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Quiz;
