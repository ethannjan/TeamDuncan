import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Divider,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EditQuizForm = ({ selectedQuizId, onBack }) => {
  const [quizData, setQuizData] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const docRef = doc(db, 'quizzes', selectedQuizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuizData(docSnap.data());
        } else {
          console.error('Quiz not found!');
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
      }
    };
    if (selectedQuizId) {
      fetchQuizData();
    }
  }, [selectedQuizId]);

  const handleSaveChanges = async () => {
    if (!quizData) return;

    try {
      console.log('Saving questions:', quizData.questions);
      // Save the updated quiz data to Firestore
      await updateDoc(doc(db, 'quizzes', selectedQuizId), { questions: quizData.questions });
      alert('Quiz updated successfully!');
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error saving quiz data:', err);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updatedQuestions });
    setHasUnsavedChanges(true);
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuizData({ ...quizData, questions: updatedQuestions });
    setHasUnsavedChanges(true);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      questionText: '',
      type: 'multipleChoiceMultiple', // Default to this type
      options: ['', ''], // Two empty options for now
      answer: '', // Empty answer
    };
    const updatedQuestions = [...quizData.questions, newQuestion];
    setQuizData({ ...quizData, questions: updatedQuestions });
    setHasUnsavedChanges(true);
  };

  if (!quizData) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 5 }}>
        Loading quiz data...
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      {/* Top Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveChanges}
          disabled={!hasUnsavedChanges}
        >
          Save
        </Button>
      </Box>

      {/* Header */}
      <Typography variant="h4" align="center" gutterBottom>
        Edit Quiz
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ mb: 3 }}>
        Quiz Name: {quizData.quizName} | Subject: {quizData.subject}
      </Typography>

      {/* Existing Questions Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Existing Questions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {quizData.questions.length > 0 ? (
            quizData.questions.map((question, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                {/* Question Type Dropdown */}
                <FormControl fullWidth margin="normal">
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={question.type}
                    onChange={(e) => {
                      const updatedQuestions = [...quizData.questions];
                      updatedQuestions[index].type = e.target.value;
                      setQuizData({ ...quizData, questions: updatedQuestions });
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <MenuItem value="multipleChoice">Multiple Choice</MenuItem>
                    <MenuItem value="multipleChoiceMultiple">Multiple Choice (Multiple Answers)</MenuItem>
                    <MenuItem value="fillInTheBlanks">Fill in the Blanks</MenuItem>
                    <MenuItem value="trueFalse">True/False</MenuItem>
                    <MenuItem value="identification">Identification</MenuItem>
                  </Select>
                </FormControl>

                {/* Question Text */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TextField
                    label={`Question ${index + 1}`}
                    value={question.questionText}
                    onChange={(e) => {
                      const updatedQuestions = [...quizData.questions];
                      updatedQuestions[index].questionText = e.target.value;
                      setQuizData({ ...quizData, questions: updatedQuestions });
                      setHasUnsavedChanges(true);
                    }}
                    fullWidth
                    margin="normal"
                  />
                  <IconButton
                    aria-label="delete-question"
                    color="error"
                    onClick={() => handleDeleteQuestion(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {/* Options for Multiple Choice */}
                {['multipleChoice', 'multipleChoiceMultiple'].includes(question.type) &&
                  question.options.map((option, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TextField
                        label={`Option ${i + 1}`}
                        value={option}
                        onChange={(e) => {
                          const updatedOptions = [...question.options];
                          updatedOptions[i] = e.target.value;
                          const updatedQuestions = [...quizData.questions];
                          updatedQuestions[index].options = updatedOptions;
                          setQuizData({ ...quizData, questions: updatedQuestions });
                          setHasUnsavedChanges(true);
                        }}
                        fullWidth
                      />
                      <IconButton
                        aria-label="delete-option"
                        color="error"
                        onClick={() => handleDeleteOption(index, i)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                
                {/* Answer Field */}
                <TextField
                  label="Answer"
                  value={question.answer}
                  onChange={(e) => {
                    const updatedQuestions = [...quizData.questions];
                    updatedQuestions[index].answer = e.target.value;
                    setQuizData({ ...quizData, questions: updatedQuestions });
                    setHasUnsavedChanges(true);
                  }}
                  fullWidth
                  margin="normal"
                />
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No questions available.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Add New Question Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddQuestion}
        >
          Add New Question
        </Button>
      </Box>

      {/* Bottom Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveChanges}
          disabled={!hasUnsavedChanges}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default EditQuizForm;
