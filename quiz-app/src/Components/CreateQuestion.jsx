import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const CreateQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ questionText: '', options: ['', '', '', ''], answer: '' });

  const questionsCollection = collection(db, 'questions');

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(questionsCollection);
      setQuestions(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    fetchQuestions();
  }, []);

  const addQuestion = async () => {
    await addDoc(questionsCollection, newQuestion);
    setNewQuestion({ questionText: '', options: ['', '', '', ''], answer: '' });
  };

  return (
    <div>
      <h2>Create Question</h2>
      {/* Form to add new question */}
      <input
        type="text"
        placeholder="Question Text"
        value={newQuestion.questionText}
        onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
      />
      <div>
        {newQuestion.options.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => {
              const updatedOptions = [...newQuestion.options];
              updatedOptions[index] = e.target.value;
              setNewQuestion({ ...newQuestion, options: updatedOptions });
            }}
          />
        ))}
      </div>
      <input
        type="text"
        placeholder="Answer (index of correct option)"
        value={newQuestion.answer}
        onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
      />
      <button onClick={addQuestion}>Add Question</button>

      {/* Display existing questions */}
      <div>
        <h3>Existing Questions</h3>
        {questions.map((q) => (
          <div key={q.id}>
            <p>{q.questionText}</p>
            {/* CRUD buttons for questions */}
            <button onClick={() => updateQuestion(q.id, q)}>Update</button>
            <button onClick={() => deleteQuestion(q.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateQuestion;
