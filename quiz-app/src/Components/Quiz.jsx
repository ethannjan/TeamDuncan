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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [selectedAnswersMultiple, setSelectedAnswersMultiple] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0); // Timer

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

  // Timer for quiz
  useEffect(() => {
    if (quizCompleted || isLocked) return;

    const timer = setInterval(() => {
      setTimeSpent((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizCompleted, isLocked]);

  const startQuiz = (quiz) => {
    if (!quiz.questions || quiz.questions.length === 0) {
      alert('This quiz has no questions.');
      return;
    }
    setSelectedQuiz(quiz);
    setCurrentIndex(0);
    setQuestion(quiz.questions[0]);
    setTimeSpent(0);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleAnswerChange = (e, optionIndex) => {
    if (question.type === 'multipleChoiceMultiple') {
      const updatedAnswers = selectedAnswersMultiple.includes(optionIndex)
        ? selectedAnswersMultiple.filter((idx) => idx !== optionIndex)
        : [...selectedAnswersMultiple, optionIndex];
      setSelectedAnswersMultiple(updatedAnswers);
    } else {
      setSelectedAnswer(e.target.value);
    }
  };
  

  const validateAnswer = () => {
    if (!isLocked) {
      let isCorrect = false;
  
      if (question.type === 'multipleChoice') {
        // single answer question
        isCorrect = question.answer === selectedAnswer;
      } else if (question.type === 'multipleChoiceMultiple') {
        // multiple answer question
        const sortedCorrectAnswers = question.answer.split(',').map((item) => item.trim()).sort();
        const sortedUserAnswers = selectedAnswersMultiple.sort();
        isCorrect = JSON.stringify(sortedCorrectAnswers) === JSON.stringify(sortedUserAnswers);
      } else if (question.type === 'trueFalse') {
        isCorrect = question.answer.toString() === selectedAnswer.toLowerCase();
      } else if (question.type === 'identification' || question.type === 'fillInTheBlanks') {
        isCorrect = question.answer.trim().toLowerCase() === selectedAnswer.trim().toLowerCase();
      }
  
      if (isCorrect) {
        setScore((prevScore) => prevScore + 1);
      }
      setIsLocked(true);
    }
  };
  

  const goToNextQuestion = () => {
    if (isLocked) {
      if (currentIndex === selectedQuiz.questions.length - 1) {
        setQuizCompleted(true);
        return;
      }
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        setQuestion(selectedQuiz.questions[nextIndex]);
        setSelectedAnswer('');
        setSelectedAnswersMultiple([]);
        setIsLocked(false);
        return nextIndex;
      });
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentIndex(0);
    setQuestion(null);
    setScore(0);
    setIsLocked(false);
    setQuizCompleted(false);
    setSelectedAnswer('');
    setSelectedAnswersMultiple([]);
    setTimeSpent(0);
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
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom>{selectedQuiz.quizName}</Typography>
        {quizCompleted ? (
          <Box textAlign="center">
            <Typography variant="h5">
              Quiz Completed! You scored {score} out of {selectedQuiz.questions.length}.
            </Typography>
            <Button variant="contained" onClick={resetQuiz} sx={{ mt: 3 }}>
              Back to Quiz List
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Question {currentIndex + 1}: {question.questionText}
            </Typography>

            {question.type === 'multipleChoice' || question.type === 'multipleChoiceMultiple' ? (
              <FormControl>
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      question.type === 'multipleChoiceMultiple' ? (
                        <Checkbox
                          checked={selectedAnswersMultiple.includes(index)}
                          onChange={(e) => handleAnswerChange(e, index)}
                        />
                      ) : (
                        <Radio
                          checked={selectedAnswer === index.toString()}
                          onChange={() => setSelectedAnswer(index.toString())}
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
            ) : (
              <TextField
                fullWidth
                label="Your Answer"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
              />
            )}

            <Button variant="contained" onClick={validateAnswer} sx={{ mt: 3 }}>
              Submit Answer
            </Button>
            <Button
              variant="contained"
              onClick={goToNextQuestion}
              sx={{ mt: 3, ml: 2 }}
              disabled={!isLocked}
            >
              Next Question
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Quiz;
