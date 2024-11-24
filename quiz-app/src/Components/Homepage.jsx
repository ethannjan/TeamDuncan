import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import TeacherDashboard from './TeacherDashboard';
import Quiz from './Quiz';
import './Homepage.css';  

const Homepage = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole'); 
    if (role) {
      setUserRole(role); 
    }
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');  
    alert('You have logged out.');
    navigate('/login');  
  };

  if (!userRole) {
    return <div>Create account to log in.</div>;  // Show login message if no role
  }

  return (
    <div className="homepage-container">
      <div className="content">
        {userRole === 'teacher' && (
          <div className="teacher-dashboard">
            <TeacherDashboard />
          </div>
        )}
        {userRole === 'student' && (
          <div className="student-dashboard">
            <Quiz />
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;