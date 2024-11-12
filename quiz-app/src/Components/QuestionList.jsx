import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, 'questions'));
      const questionsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(questionsList);
    };
    fetchQuestions();
  }, []);

  return (
    <div>
      <h2>Questions</h2>
      {questions.map(question => (
        <div key={question.id}>
          <h3>{question.question}</h3>
          {question.options.map((option, index) => (
            <div key={index}>
              <input type="radio" name={question.id} /> {option}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
