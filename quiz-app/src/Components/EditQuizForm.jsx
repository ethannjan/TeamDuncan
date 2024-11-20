import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
} from '@mui/material';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EditQuizForm = ({ selectedQuizId }) => {
  const [quizData, setQuizData] = useState(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newAnswer, setNewAnswer] = useState('');
  const [newType, setNewType] = useState('multipleChoice');

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const docRef = doc(db, 'quizzes', selectedQuizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuizData(docSnap.data());
        } else {
          console.error('No such quiz found!');
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
      }
    };
    fetchQuizData();
  }, [selectedQuizId]);

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) {
      alert('Question text is required!');
      return;
    }

    if (['multipleChoice', 'multipleChoiceMultiple'].includes(newType) && newOptions.some((opt) => !opt.trim())) {
      alert('All options must be filled out!');
      return;
    }

    if (!newAnswer.trim()) {
      alert('Answer is required!');
      return;
    }

    const newQuestion = {
      questionText: newQuestionText,
      options: ['multipleChoice', 'multipleChoiceMultiple'].includes(newType)
        ? newOptions
        : [],
      answer:
        newType === 'multipleChoiceMultiple'
          ? newAnswer.split(',').map(Number)
          : newAnswer,
      type: newType,
    };

    try {
      const updatedQuestions = [...quizData.questions, newQuestion];
      await updateDoc(doc(db, 'quizzes', selectedQuizId), {
        questions: updatedQuestions,
      });
      setQuizData({ ...quizData, questions: updatedQuestions });

      // Reset input fields
      setNewQuestionText('');
      setNewOptions(['', '', '', '']);
      setNewAnswer('');
      setNewType('multipleChoice');
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };

  if (!quizData) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', mt: 5 }}>
        Loading quiz data...
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Edit Quiz: {quizData.quizName}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Subject: {quizData.subject}
      </Typography>

      {/* Existing Questions */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Existing Questions
      </Typography>
      {quizData.questions.map((question, index) => (
        <Box key={index} sx={{ border: '1px solid #ddd', p: 2, mb: 2 }}>
          <TextField
            label={`Question ${index + 1}`}
            value={question.questionText}
            onChange={(e) => {
              const updatedQuestions = [...quizData.questions];
              updatedQuestions[index].questionText = e.target.value;
              setQuizData({ ...quizData, questions: updatedQuestions });
            }}
            fullWidth
            margin="normal"
          />
          {['multipleChoice', 'multipleChoiceMultiple'].includes(question.type) &&
            question.options.map((option, i) => (
              <TextField
                key={i}
                label={`Option ${i + 1}`}
                value={option}
                onChange={(e) => {
                  const updatedOptions = [...question.options];
                  updatedOptions[i] = e.target.value;
                  const updatedQuestions = [...quizData.questions];
                  updatedQuestions[index].options = updatedOptions;
                  setQuizData({ ...quizData, questions: updatedQuestions });
                }}
                fullWidth
                margin="normal"
              />
            ))}
          <TextField
            label="Answer"
            value={question.answer}
            onChange={(e) => {
              const updatedQuestions = [...quizData.questions];
              updatedQuestions[index].answer = e.target.value;
              setQuizData({ ...quizData, questions: updatedQuestions });
            }}
            fullWidth
            margin="normal"
          />
        </Box>
      ))}

      {/* Add New Question */}
      <Typography variant="h6" sx={{ mt: 5 }}>
        Add New Question
      </Typography>
      <TextField
        label="Question Text"
        value={newQuestionText}
        onChange={(e) => setNewQuestionText(e.target.value)}
        fullWidth
        margin="normal"
      />
      {['multipleChoice', 'multipleChoiceMultiple'].includes(newType) &&
        newOptions.map((option, index) => (
          <TextField
            key={index}
            label={`Option ${index + 1}`}
            value={option}
            onChange={(e) => {
              const updatedOptions = [...newOptions];
              updatedOptions[index] = e.target.value;
              setNewOptions(updatedOptions);
            }}
            fullWidth
            margin="normal"
          />
        ))}
      <TextField
        label="Answer"
        value={newAnswer}
        onChange={(e) => setNewAnswer(e.target.value)}
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Question Type</InputLabel>
        <Select value={newType} onChange={(e) => setNewType(e.target.value)}>
          <MenuItem value="multipleChoice">Multiple Choice</MenuItem>
          <MenuItem value="multipleChoiceMultiple">
            Multiple Choice (Multiple Answers)
          </MenuItem>
          <MenuItem value="trueFalse">True/False</MenuItem>
          <MenuItem value="identification">Identification</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddQuestion}
        sx={{ mt: 2 }}
      >
        Add Question
      </Button>
    </Box>
  );
};

export default EditQuizForm;
