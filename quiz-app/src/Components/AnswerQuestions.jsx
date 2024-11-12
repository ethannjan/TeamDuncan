// src/Components/AnswerQuestions.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const AnswerQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      const questionsCollection = collection(db, 'questions');
      const querySnapshot = await getDocs(questionsCollection);
      setQuestions(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  return (
    <div>
      <h2>Answer Questions</h2>
      {questions.map((q) => (
        <div key={q.id}>
          <p>{q.questionText}</p>
          {q.options.map((option, index) => (
            <div key={index}>
              <input
                type="radio"
                name={q.id}
                value={index}
                checked={answers[q.id] === index}
                onChange={() => handleAnswerChange(q.id, index)}
              />
              <label>{option}</label>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AnswerQuestions;
