import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TimerIcon from '@mui/icons-material/Timer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';

const CreateQuestion = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [newModuleName, setNewModuleName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    answer: '',
    moduleId: '',
  });
  const [quizTime, setQuizTime] = useState('');
  const [error, setError] = useState('');

  const modulesCollection = collection(db, 'modules');
  const questionsCollection = collection(db, 'questions');

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      fetchModuleQuestions(selectedModule);
    }
  }, [selectedModule]);

  const fetchModules = async () => {
    try {
      const querySnapshot = await getDocs(modulesCollection);
      setModules(querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name })));
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Failed to fetch modules');
    }
  };

  const fetchModuleQuestions = async (moduleId) => {
    try {
      const q = query(questionsCollection, where('moduleId', '==', moduleId));
      const querySnapshot = await getDocs(q);
      setQuestions(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions');
    }
  };

  const createModule = async () => {
    if (!newModuleName.trim()) {
      setError('Please enter a module name');
      return;
    }

    try {
      const docRef = await addDoc(modulesCollection, {
        name: newModuleName,
        createdAt: new Date(),
      });
      
      setModules([...modules, { id: docRef.id, name: newModuleName }]);
      setNewModuleName('');
      setError('');
    } catch (error) {
      console.error('Error creating module:', error);
      setError('Failed to create module');
    }
  };

  const deleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module and all its questions?')) {
      return;
    }

    try {
      // Delete the module
      await deleteDoc(doc(db, 'modules', moduleId));
      
      // Delete all questions in the module
      const q = query(questionsCollection, where('moduleId', '==', moduleId));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setModules(modules.filter((m) => m.id !== moduleId));
      if (selectedModule === moduleId) {
        setSelectedModule('');
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      setError('Failed to delete module');
    }
  };

  const addQuestion = async () => {
    if (!selectedModule) {
      setError('Please select a module first');
      return;
    }
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
        moduleId: selectedModule,
        timeLimit: quizTime ? parseInt(quizTime) : null
      });
      
      setQuestions([...questions, { ...newQuestion, id: docRef.id }]);
      setNewQuestion({ questionText: '', options: ['', '', '', ''], answer: '', moduleId: selectedModule });
      setError('');
    } catch (error) {
      console.error('Error adding question:', error);
      setError('Failed to add question');
    }
  };

  const deleteQuestion = async (questionId) => {
    try {
      await deleteDoc(doc(db, 'questions', questionId));
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question');
    }
  };

  const saveQuizTime = async () => {
    if (!selectedModule) {
      setError('Please select a module first');
      return;
    }
    if (!quizTime || isNaN(quizTime) || parseInt(quizTime) <= 0) {
      setError('Please enter a valid time in minutes');
      return;
    }

    try {
      const updatePromises = questions.map(question => {
        const questionDoc = doc(db, 'questions', question.id);
        return updateDoc(questionDoc, { timeLimit: parseInt(quizTime) });
      });

      await Promise.all(updatePromises);
      setError('');
      alert(`Quiz time limit set to ${quizTime} minutes for all questions in this module`);
    } catch (error) {
      console.error('Error saving quiz time:', error);
      setError('Failed to save quiz time');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Module Creation Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderIcon /> Question Module
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              label="New Module Name"
              variant="outlined"
              fullWidth
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<AddIcon />}
              onClick={createModule}
            >
              Create Module
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Module Selection */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel>Select Module</InputLabel>
          <Select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            label="Select Module"
          >
            {modules.map((module) => (
              <MenuItem key={module.id} value={module.id}>
                {module.name}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteModule(module.id);
                  }}
                  sx={{ ml: 2 }}
                >
                  <DeleteIcon />
                </IconButton>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedModule && (
        <>
          {/* Question Creation Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
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
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon /> Set Module Timer
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
                  Set Module Time
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Questions List */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Module Questions
            </Typography>
            
            {questions.map((question, index) => (
              <Accordion key={question.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Question {index + 1}: {question.questionText}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {question.options.map((option, optIndex) => (
                      <Grid item xs={12} key={optIndex}>
                        <Typography color={optIndex === parseInt(question.answer) ? 'success.main' : 'inherit'}>
                          Option {optIndex + 1}: {option}
                        </Typography>
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteQuestion(question.id)}
                      >
                        Delete Question
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </>
      )}

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateQuestion;