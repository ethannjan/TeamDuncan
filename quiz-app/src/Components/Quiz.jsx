import React, { useState, useRef, useEffect } from 'react';
import './Quiz.css';
import { data } from '../assets/data';

const Quiz = () => {
  const [index, setIndex] = useState(0);  // Start with the first question (index 0)
  const [question, setQuestion] = useState(data[index]);
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);  // Timer set to 10 seconds

  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Option3 = useRef(null);
  const Option4 = useRef(null);

  const option_array = [Option1, Option2, Option3, Option4];

  const checkAns = (e, ans) => {
    if (!lock) {
      if (question.ans === ans) {
        e.target.classList.add("correct");
        setScore(prev => prev + 1);
      } else {
        e.target.classList.add("wrong");
      }
      setLock(true);
      option_array[question.ans - 1].current.classList.add("correct");
    }
  };

  const next = () => {
    if (lock || timeLeft === 0) {  // Move to next if locked or time is up
      if (index === data.length - 1) {
        setResult(true);
        return;
      }
      setIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        setQuestion(data[nextIndex]);
        setTimeLeft(10);  // Reset timer for the next question
        return nextIndex;
      });
      setLock(false);
      option_array.forEach((option) => {
        option.current.classList.remove("wrong");
        option.current.classList.remove("correct");
      });
    }
  };

  const reset = () => {
    setIndex(0);
    setQuestion(data[0]);
    setScore(0);
    setLock(false);
    setResult(false);
    setTimeLeft(10);
  };

  // Timer effect
  useEffect(() => {
    if (result || lock) return;  // Stop timer if quiz is over or question is locked
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 1) {
          clearInterval(timer); // Clear interval at the end
          next();                // Automatically go to next question
          return 10;             // Reset time (for next question)
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);  // Clear interval on component unmount or question change
  }, [timeLeft, lock, result]);

  return (
    <div className="container">
      <h1>Quiz App</h1>
      <hr />
      {result ? (
        <>
          <h2>You Scored {score} out of {data.length}</h2>
          <button onClick={reset}>Reset</button>
        </>
      ) : (
        <>
          <h2>{index + 1}. {question.question}</h2>
          <ul>
            <li ref={Option1} onClick={(e) => checkAns(e, 1)}>{question.option1}</li>
            <li ref={Option2} onClick={(e) => checkAns(e, 2)}>{question.option2}</li>
            <li ref={Option3} onClick={(e) => checkAns(e, 3)}>{question.option3}</li>
            <li ref={Option4} onClick={(e) => checkAns(e, 4)}>{question.option4}</li>
          </ul>
          <button onClick={next}>Next</button>
          <div className="index">{index + 1} of {data.length} questions</div>
          <div className="timer">Time Left: {timeLeft} seconds</div>
        </>
      )}
    </div>
  );
};

export default Quiz;
