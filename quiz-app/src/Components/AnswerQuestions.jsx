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
import LogoutButton from './LogoutButton'; 

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
  const [rank, setRank] = useState(null);
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
    
        // Shuffle the questions
        shuffleArray(fetchedQuestions);
    
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

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    let calculatedScore = 0;

    // Calculate the score
    questions.forEach((q) => {
      if (answers[q.id] === parseInt(q.answer, 10)) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);

    const scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
    const selectedModuleName = modules.find(m => m.id === selectedModule)?.name || 'Unknown Module';
    const newScore = {
      email: userEmail,
      score: calculatedScore,
      totalQuestions: questions.length,
      module: selectedModuleName,
      date: new Date().toISOString()
    };

    // Add new score to leaderboard
    scores.push(newScore);
    localStorage.setItem('leaderboardScores', JSON.stringify(scores));

    // Calculate rank for the current module
    const moduleScores = scores.filter(s => s.module === selectedModuleName);
    moduleScores.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
    const newRank = moduleScores.findIndex(s => s.email === userEmail) + 1;
    setRank(newRank);

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FolderIcon color="primary" />
            <Typography variant="h5">Select a Module</Typography>
          </Box>
          <LogoutButton />
        </Box>


          <FormControl fullWidth>
            <InputLabel>Select Module</InputLabel>
            <Select
              value={selectedModule}
              onChange={handleModuleSelect}
            >
              {modules.map(module => (
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
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
      Quiz Results
    </Typography>
    <LogoutButton /> {/* This will appear on the right side */}
  </Box>
  
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 500 }}>
      Score: {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
    </Typography>
    {rank && (
      <Typography variant="h6" sx={{ mt: 2, fontWeight: 400 }}>
        Your Rank: {rank} in {modules.find(m => m.id === selectedModule)?.name}
      </Typography>
    )}
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
                setRank(null);
              }}
            >
              Take Another Quiz
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuizIcon color="primary" />
          <Typography variant="h5">Answer Questions</Typography>
        </Box>
        <LogoutButton />
      </Box>
        
        <Divider sx={{ mb: 3 }} />

        {quizStarted ? (
          <Box>
            {timeLeft !== null && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TimerIcon />
                  <Typography variant="h6">
                    Time Remaining: {formatTime(timeLeft)}
                  </Typography>
                </Box>
                {timeWarning && (
                  <Typography variant="body2" color="error">
                    Less than 1 minute remaining!
                  </Typography>
                )}
              </Box>
            )}
            
            {questions.map((question, index) => (
              <Card key={question.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Question {index + 1}:
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    {question.questionText}
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value, 10))}
                    >
                      {question.options.map((option, optIndex) => (
                        <FormControlLabel
                          key={optIndex}
                          value={optIndex}
                          control={<Radio />}
                          label={option}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                disabled={Object.keys(answers).length !== questions.length}
                onClick={handleSubmit}
              >
                Submit Quiz
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Start Quiz for {modules.find(m => m.id === selectedModule)?.name}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={startQuiz}
              sx={{ mt: 2 }}
            >
              Start Quiz
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AnswerQuestions;
