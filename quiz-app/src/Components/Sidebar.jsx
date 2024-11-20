import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, Box, Typography } from '@mui/material';

const Sidebar = ({ setView, currentView }) => {
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
        backgroundColor: '#1976d2',
        color: '#fff',
        padding: '20px',
      }}
    >
      <Typography variant="h5" component="div" sx={{ mb: 4, fontWeight: 'bold' }}>
        Manage Quiz
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.view}
            disablePadding
            sx={{
              backgroundColor: currentView === item.view ? '#1565c0' : 'transparent',
              borderRadius: '4px',
              mb: 1,
            }}
          >
            <ListItemButton
              onClick={() => setView(item.view)}
              sx={{
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#0d47a1',
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;