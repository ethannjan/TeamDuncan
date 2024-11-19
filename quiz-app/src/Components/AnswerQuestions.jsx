import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import FolderIcon from '@mui/icons-material/Folder';
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
  const navigate = useNavigate();

  const auth = getAuth();
  const user = auth.currentUser;
  const userEmail = user ? user.email : "Guest";

  // Fetch available modules
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

  // Fetch questions for selected module
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
        
        // Get time limit from the first question
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

  // Timer functionality
  useEffect(() => {
    if (!quizStarted || timeLeft === null) return;

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
  }, [quizStarted, timeWarning]);

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

    navigate('/leaderboard', { 
      state: { 
        score: calculatedScore,
        email: userEmail,
        module: selectedModuleName,
        totalQuestions: questions.length
      }
    });
  };

  const isAllAnswered = questions.length > 0 && 
    questions.every(q => answers[q.id] !== undefined);

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
          <Box display="flex" alignItems="center" gap={2} mb={4}>
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

          <Typography variant="body1" color="text.secondary" align="center">
            Select a module to begin the quiz
          </Typography>
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <QuizIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" component="h1">
                Quiz Time
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {modules.find(m => m.id === selectedModule)?.name}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
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