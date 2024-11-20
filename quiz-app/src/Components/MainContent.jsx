import React from 'react';
import Quiz from './Quiz';
import CreateQuiz from './CreateQuiz';
import EditQuiz from './EditQuiz';
import DeleteQuiz from './DeleteQuiz';

const MainContent = ({ currentView }) => {
  return (
    <div style={{ flex: 1, padding: '20px' }}>
      {currentView === 'quiz' && <Quiz />}
      {currentView === 'createQuiz' && <CreateQuiz />}
      {currentView === 'editQuiz' && <EditQuiz />}
      {currentView === 'deleteQuiz' && <DeleteQuiz />}
    </div>
  );
};

export default MainContent;