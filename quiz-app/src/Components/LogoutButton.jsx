// components/LogoutButton.js
import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session data (localStorage, cookies, etc.)
    localStorage.removeItem('userData'); // Adjust based on how you store user data
    navigate('/login'); // Redirect to the login page after logout
  };

  return (
    <Button variant="outlined" color="primary" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
