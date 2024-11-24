import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  IconButton,
  Paper,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';

const CreateQuiz = () => {
  const [quizName, setQuizName] = useState('');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multipleChoice');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [correctAnswersMultiple, setCorrectAnswersMultiple] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleDeleteOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    setCorrectAnswersMultiple(correctAnswersMultiple.filter((idx) => idx !== index));
  };

  const addQuestion = () => {
    if (!questionText.trim()) {
      alert('Question text cannot be empty.');
      return;
    }

    let newQuestion = {
      questionText,
      type: questionType,
      options: [],
      answer: '',
    };

    if (questionType === 'multipleChoice') {
      if (!options[correctAnswer]) {
        alert('Please select a valid correct answer.');
        return;
      }
      newQuestion.options = options;
      newQuestion.answer = parseInt(correctAnswer, 10);
    } else if (questionType === 'multipleChoiceMultiple') {
      if (correctAnswersMultiple.length === 0) {
        alert('Please select at least one correct answer.');
        return;
      }
      newQuestion.options = options;
      newQuestion.answer = correctAnswersMultiple;
    } else if (questionType === 'trueFalse') {
      newQuestion.answer = correctAnswer === 'true';
    } else if (questionType === 'identification') {
      if (!correctAnswer.trim()) {
        alert('Correct answer cannot be empty.');
        return;
      }
      newQuestion.answer = correctAnswer.trim();
    }

    setQuestions([...questions, newQuestion]);
    setQuestionText('');
    setOptions(['', '']);
    setCorrectAnswer('');
    setCorrectAnswersMultiple([]);
    setQuestionType('multipleChoice');
  };

  const handleSaveQuiz = async () => {
    if (!quizName.trim() || !subject.trim()) {
      alert('Quiz name and subject cannot be empty.');
      return;
    }

    if (questions.length === 0) {
      alert('You must add at least one question.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'quizzes'), {
        quizName,
        subject,
        questions,
      });
      alert('Quiz successfully created!');
      setQuizName('');
      setSubject('');
      setQuestions([]);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Create a New Quiz</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Quiz Name"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          fullWidth
          margin="normal"
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Add a Question</Typography>
        <TextField
          label="Question Text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          select
          label="Question Type"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="multipleChoice">Multiple Choice</MenuItem>
          <MenuItem value="multipleChoiceMultiple">Multiple Choice (Multiple)</MenuItem>
          <MenuItem value="trueFalse">True/False</MenuItem>
          <MenuItem value="identification">Identification</MenuItem>
        </TextField>

        {(questionType === 'multipleChoice' || questionType === 'multipleChoiceMultiple') && (
          <Box>
            {options.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  label={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  fullWidth
                />
                <IconButton onClick={() => handleDeleteOption(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={handleAddOption} sx={{ mb: 2 }}>Add Option</Button>
          </Box>
        )}

        {questionType === 'multipleChoice' && (
          <TextField
            select
            label="Correct Answer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            fullWidth
          >
            {options.map((option, index) => (
              <MenuItem key={index} value={index}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}

        {questionType === 'multipleChoiceMultiple' && (
          <Box>
            <Typography>Select Correct Answers:</Typography>
            {options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={correctAnswersMultiple.includes(index)}
                    onChange={() =>
                      setCorrectAnswersMultiple((prev) =>
                        prev.includes(index)
                          ? prev.filter((i) => i !== index)
                          : [...prev, index]
                      )
                    }
                  />
                }
                label={option}
              />
            ))}
          </Box>
        )}

        {(questionType === 'trueFalse' || questionType === 'identification') && (
          <TextField
            label="Correct Answer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            fullWidth
            margin="normal"
          />
        )}

        <Button variant="contained" onClick={addQuestion} fullWidth sx={{ mt: 2 }}>
          Add Question
        </Button>
      </Paper>

      <Typography variant="h5">Questions:</Typography>
      {questions.map((q, i) => (
        <Box key={i} sx={{ mb: 2 }}>
          <Typography>{i + 1}. {q.questionText} ({q.type})</Typography>
        </Box>
      ))}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveQuiz}
        fullWidth
        sx={{ mt: 3 }}
        disabled={isSubmitting}
      >
        Save Quiz
      </Button>
    </Box>
  );
};

export default CreateQuiz;
