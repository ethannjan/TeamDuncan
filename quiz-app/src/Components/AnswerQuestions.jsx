import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Typography
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';

const AnswerQuestions = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);
  const [moduleSelected, setModuleSelected] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  const auth = getAuth();
  const user = auth.currentUser;
  const userEmail = user ? user.email : "Guest";

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modulesCollection = collection(db, 'modules');
        const querySnapshot = await getDocs(modulesCollection);
        const fetchedModules = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setModules(fetchedModules);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load modules:", err);
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedModule) return;
      
      setLoading(true);
      try {
        const questionsCollection = collection(db, 'questions');
        const q = query(questionsCollection, where('moduleId', '==', selectedModule));
        const querySnapshot = await getDocs(q);
        const fetchedQuestions = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setQuestions(fetchedQuestions);
        
        if (fetchedQuestions.length > 0 && fetchedQuestions[0].timeLimit) {
          setTimeLeft(fetchedQuestions[0].timeLimit * 60);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load questions:", err);
        setLoading(false);
      }
    };

    if (selectedModule) {
      fetchQuestions();
    }
  }, [selectedModule]);

  useEffect(() => {
    if (!quizStarted || timeLeft === null || quizSubmitted) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerInterval);
          handleSubmit();
          return 0;
        }
        
        if (prevTime <= 60 && !timeWarning) {
          setTimeWarning(true);
        }
        
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [quizStarted, timeWarning, quizSubmitted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleModuleSelect = (event) => {
    setSelectedModule(event.target.value);
    setModuleSelected(true);
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

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

    const scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
    const selectedModuleName = modules.find(m => m.id === selectedModule)?.name || 'Unknown Module';
    scores.push({ 
      email: userEmail, 
      score: calculatedScore,
      totalQuestions: questions.length,
      module: selectedModuleName,
      date: new Date().toISOString()
    });
    localStorage.setItem('leaderboardScores', JSON.stringify(scores));

    setQuizSubmitted(true);
    setReviewMode(true);
  };

  const QuestionReview = ({ question, index, userAnswer }) => {
    const isCorrect = userAnswer === parseInt(question.answer, 10);
    
    return (
      <Card sx={{ mb: 2, backgroundColor: '#f8f9fa' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                Question {index + 1}:
              </Typography>
              <Typography sx={{ mb: 2 }}>
                {question.questionText}
              </Typography>
              
              <Box sx={{ pl: 2 }}>
                {question.options.map((option, optIndex) => (
                  <Box 
                    key={optIndex}
                    sx={{
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 
                        optIndex === parseInt(question.answer, 10)
                          ? '#e8f5e9'
                          : userAnswer === optIndex && userAnswer !== parseInt(question.answer, 10)
                          ? '#ffebee'
                          : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Typography>
                      {option}
                    </Typography>
                    {optIndex === parseInt(question.answer, 10) && (
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    )}
                    {userAnswer === optIndex && userAnswer !== parseInt(question.answer, 10) && (
                      <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ mt: 1 }}>
              {isCorrect ? (
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
              ) : (
                <CancelIcon sx={{ color: 'error.main', fontSize: 28 }} />
              )}
            </Box>
          </Box>
          
          {!isCorrect && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Explanation:</Typography>
              <Typography>
                {question.explanation || "The correct answer is option " + (parseInt(question.answer, 10) + 1)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography variant="h6" align="center" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (!moduleSelected) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <FolderIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h4">
              Select a Module
            </Typography>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Choose Module</InputLabel>
            <Select
              value={selectedModule}
              onChange={handleModuleSelect}
              label="Choose Module"
            >
              {modules.map((module) => (
                <MenuItem key={module.id} value={module.id}>
                  {module.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      </Container>
    );
  }

  if (quizSubmitted && reviewMode) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>Quiz Results</Typography>
            <Typography variant="h5" sx={{ color: 'primary.main' }}>
              Score: {score} out of {questions.length} ({Math.round(score/questions.length * 100)}%)
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 4 }} />
          
          {questions.map((question, index) => (
            <QuestionReview 
              key={question.id}
              question={question}
              index={index}
              userAnswer={answers[question.id]}
            />
          ))}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/leaderboard')}
            >
              View Leaderboard
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setQuizSubmitted(false);
                setReviewMode(false);
                setModuleSelected(false);
                setSelectedModule('');
                setAnswers({});
                setQuizStarted(false);
              }}
            >
              Take Another Quiz
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!quizStarted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Ready to Start the Quiz?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Module: {modules.find(m => m.id === selectedModule)?.name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You will have {timeLeft / 60} minutes to complete {questions.length} questions.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={startQuiz}
            sx={{ minWidth: 200 }}
          >
            Start Quiz
          </Button>
        </Paper>
      </Container>
    );
  }

  const isAllAnswered = questions.length > 0 && 
    questions.every(q => answers[q.id] !== undefined);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <QuizIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4">Quiz Time</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {modules.find(m => m.id === selectedModule)?.name}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimerIcon color={timeWarning ? "error" : "primary"} />
            <Typography 
              variant="h5" 
              color={timeWarning ? "error" : "primary"}
              sx={{ fontFamily: 'monospace' }}
            >
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        </Box>

        {timeWarning && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Less than 1 minute remaining!
          </Alert>
        )}

        <Divider sx={{ mb: 3 }} />

        {questions.map((q, index) => (
          <Card key={q.id} sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Question {index + 1}:
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