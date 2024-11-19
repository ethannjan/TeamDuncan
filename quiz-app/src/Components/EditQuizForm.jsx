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

  // Fetch quiz data when the component mounts
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

  // Update question text, choices, and answers
  const handleQuestionUpdate = async (index, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index][field] = value;
    setQuizData({ ...quizData, questions: updatedQuestions });

    // Update the quiz in Firestore
    await updateDoc(doc(db, 'quizzes', selectedQuizId), {
      questions: updatedQuestions,
    });
  };

  // Add a new question to the quiz
  const handleAddQuestion = async () => {
    if (!newQuestionText || !newAnswer || newOptions.some((opt) => !opt)) {
      console.error('Please fill all fields!');
      return;
    }

    const newQuestion = {
      questionText: newQuestionText,
      options: newType === 'multipleChoice' || newType === 'multipleChoiceMultiple' ? newOptions : [],
      answer: newType === 'multipleChoiceMultiple' ? newAnswer.split(',').map(Number) : newAnswer,
      type: newType,
    };

    try {
      const updatedQuestions = [...quizData.questions, newQuestion];
      await updateDoc(doc(db, 'quizzes', selectedQuizId), {
        questions: updatedQuestions,
      });
      setQuizData({ ...quizData, questions: updatedQuestions });
      setNewQuestionText('');
      setNewOptions(['', '', '', '']);
      setNewAnswer('');
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };

  // Handle option change for adding new question
  const handleOptionChange = (e, index) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = e.target.value;
    setNewOptions(updatedOptions);
  };

  // Handle deleting a question
  const handleDeleteQuestion = async (index) => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updatedQuestions });

    // Update Firestore after deleting a question
    await updateDoc(doc(db, 'quizzes', selectedQuizId), {
      questions: updatedQuestions,
    });
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

      {/* Display and Edit Existing Questions */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Edit Existing Questions
      </Typography>
      {quizData.questions.map((question, index) => (
        <Box key={index} sx={{ border: '1px solid #ddd', p: 2, mb: 2 }}>
          {/* Edit Question Text */}
          <TextField
            label={`Question ${index + 1}`}
            value={question.questionText}
            onChange={(e) => handleQuestionUpdate(index, 'questionText', e.target.value)}
            fullWidth
            margin="normal"
          />

          {/* Edit Options for Multiple Choice Questions */}
          {['multipleChoice', 'multipleChoiceMultiple'].includes(question.type) && question.options.map((option, i) => (
            <TextField
              key={i}
              label={`Option ${i + 1}`}
              value={option}
              onChange={(e) => {
                const updatedOptions = [...question.options];
                updatedOptions[i] = e.target.value;
                handleQuestionUpdate(index, 'options', updatedOptions);
              }}
              fullWidth
              margin="normal"
            />
          ))}

          {/* Edit Answer */}
          <TextField
            label="Answer"
            value={question.answer}
            onChange={(e) => handleQuestionUpdate(index, 'answer', e.target.value)}
            fullWidth
            margin="normal"
          />

          {/* Delete Question Button */}
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteQuestion(index)}
            sx={{ mt: 2 }}
          >
            Delete Question
          </Button>
        </Box>
      ))}

      {/* Add New Question Section */}
      <Typography variant="h6" sx={{ mt: 5 }}>
        Add New Question
      </Typography>

      {/* Add Question Text */}
      <TextField
        label="New Question Text"
        value={newQuestionText}
        onChange={(e) => setNewQuestionText(e.target.value)}
        fullWidth
        margin="normal"
      />

      {/* Add Options for Multiple Choice or Multiple Answers */}
      {['multipleChoice', 'multipleChoiceMultiple'].includes(newType) && newOptions.map((option, index) => (
        <TextField
          key={index}
          label={`Option ${index + 1}`}
          value={option}
          onChange={(e) => handleOptionChange(e, index)}
          fullWidth
          margin="normal"
        />
      ))}

      {/* Add Answer for New Question */}
      <TextField
        label="Answer"
        value={newAnswer}
        onChange={(e) => setNewAnswer(e.target.value)}
        fullWidth
        margin="normal"
      />

      {/* Select Question Type */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Question Type</InputLabel>
        <Select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
        >
          <MenuItem value="multipleChoice">Multiple Choice (One Answer)</MenuItem>
          <MenuItem value="multipleChoiceMultiple">Multiple Choice (Multiple Answers)</MenuItem>
          <MenuItem value="trueFalse">True/False</MenuItem>
          <MenuItem value="identification">Identification</MenuItem>
        </Select>
      </FormControl>

      {/* Add Question Button */}
      <Button variant="contained" onClick={handleAddQuestion} sx={{ mt: 2 }}>
        Add Question
      </Button>
    </Box>
  );
};

export default EditQuizForm;
