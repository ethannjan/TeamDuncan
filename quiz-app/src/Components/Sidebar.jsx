import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ setView, currentView }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement logout logic here (e.g., clear session, auth tokens)
    navigate('/login'); // Redirect to login page
  };

  const menuItems = [
    { label: 'Quiz', view: 'quiz' },
    { label: 'Create Quiz', view: 'createQuiz' },
    { label: 'Edit Quiz', view: 'editQuiz' },
    { label: 'Delete Quiz', view: 'deleteQuiz' },
  ];

  return (
    <Box
      sx={{
        width: '250px',
        height: '100vh',
        backgroundColor: '#E6E6FA', // Pastel lavender background
        color: '#4B4B6A', // Complementary text color
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Section - Menu */}
      <Box>
        <Typography
          variant="h5"
          component="div"
          sx={{
            mb: 4,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#4B4B6A',
          }}
        >
          Manage Quiz
        </Typography>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.view}
              disablePadding
              sx={{
                backgroundColor: currentView === item.view ? '#D8BFD8' : 'transparent',
                borderRadius: '4px',
                mb: 1,
              }}
            >
              <ListItemButton
                onClick={() => setView(item.view)}
                sx={{
                  color: '#4B4B6A',
                  '&:hover': {
                    backgroundColor: '#C5B3E5',
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom Section - Logout */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogout}
        sx={{
          backgroundColor: '#B39DDB', // Slightly darker lavender for the button
          color: '#fff',
          '&:hover': {
            backgroundColor: '#9C86D4',
          },
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Sidebar;
