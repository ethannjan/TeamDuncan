
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const TeacherDashboard = () => {
  const [currentView, setCurrentView] = useState('createQuiz');

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar setView={setCurrentView} />
      <MainContent currentView={currentView} />
    </div>
  );
};

export default TeacherDashboard;