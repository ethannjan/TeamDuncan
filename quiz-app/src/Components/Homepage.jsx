import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import TeacherDashboard from './TeacherDashboard';
import Quiz from './Quiz';
import './Homepage.css';  // Import the external CSS for styling

const Homepage = () => {
  const [userRole, setUserRole] = useState(null);

  // UseEffect to retrieve the user role from localStorage (or from an authentication service)
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
      
      {/* Log Out Button */}
      <button className="logout-btn" onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Homepage;