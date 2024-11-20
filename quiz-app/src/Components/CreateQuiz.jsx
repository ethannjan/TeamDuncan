import React, { useState } from 'react';
import { Button, TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText } from '@mui/material';
import { db } from '../firebaseConfig';  // Firebase configuration
import { doc, setDoc, collection } from 'firebase/firestore';

const CreateQuiz = () => {
  const [quizName, setQuizName] = useState('');
  const [subject, setSubject] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [options, setOptions] = useState([{ text: '', isCorrect: false }]);
  const [questions, setQuestions] = useState([]);

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
  };

  const handleOptionChange = (index, key, value) => {
    const updatedOptions = options.map((option, i) =>
      i === index ? { ...option, [key]: value } : option
    );
    setOptions(updatedOptions);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      questionText,
      questionType,
      options,
    };
    setQuestions([...questions, newQuestion]);
    setQuestionText('');
    setOptions([{ text: '', isCorrect: false }]);  // Reset options for the next question
  };

  const handleSaveQuiz = async () => {
    try {
      const quizRef = doc(collection(db, 'quizzes'));
      const quizData = {
        quizName,
        subject,
        questions: questions.map((question) => ({
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options.map((option) => ({
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        })),
      };
      await setDoc(quizRef, quizData);
      alert('Quiz saved successfully');
    } catch (error) {
      console.error('Error saving quiz: ', error);
      alert('Error saving quiz');
    }
  };

  return (
    <div>
      <TextField
        label="Quiz Name"
        value={quizName}
        onChange={(e) => setQuizName(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        fullWidth
        required
      />

      <div>
        <TextField
          label="Question Text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          fullWidth
          required
        />

        <FormControl fullWidth required>
          <InputLabel>Question Type</InputLabel>
          <Select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
            <MenuItem value="true/false">True/False</MenuItem>
            {/* Add other question types here */}
          </Select>
          <FormHelperText>Choose the question type</FormHelperText>
        </FormControl>

        {/* Options */}
        {options.map((option, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <TextField
              label={`Option ${index + 1}`}
              value={option.text}
              onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
              fullWidth
              required
            />
            <input
              type="checkbox"
              checked={option.isCorrect}
              onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
            />
            {options.length > 1 && (
              <Button onClick={() => handleRemoveOption(index)} variant="outlined" color="error">
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button onClick={handleAddOption} variant="contained" color="primary" style={{ marginTop: '10px' }}>
          Add Option
        </Button>
        <Button onClick={handleAddQuestion} variant="contained" color="secondary" style={{ marginTop: '20px' }}>
          Add Question
        </Button>
      </div>

      {/* Display the added questions */}
      <div style={{ marginTop: '20px' }}>
        <h3>Added Questions</h3>
        {questions.map((question, index) => (
          <div key={index}>
            <strong>{question.questionText}</strong>
            <div>Type: {question.questionType}</div>
            <div>
              Options:
              {question.options.map((option, i) => (
                <div key={i}>{option.text} {option.isCorrect && <span>(Correct)</span>}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSaveQuiz} variant="contained" color="primary" style={{ marginTop: '30px' }}>
        Save Quiz
      </Button>
    </div>
  );
};

export default CreateQuiz;