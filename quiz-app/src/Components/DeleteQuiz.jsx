import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Firestore instance
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Button, Box, Typography, List, ListItem, Divider } from '@mui/material';

const DeleteQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Fetch quizzes from Firestore
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        const quizzesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuizzes(quizzesData);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      }
    };
    fetchQuizzes();
  }, []);

  // Handle deleting a selected quiz
  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      const quizRef = doc(db, 'quizzes', selectedQuiz.id);
      await deleteDoc(quizRef);
      setQuizzes(quizzes.filter(quiz => quiz.id !== selectedQuiz.id));
      setSelectedQuiz(null);
      alert('Quiz deleted successfully!');
    } catch (err) {
      console.error('Error deleting quiz:', err);
    }
  };

  // Handle deleting all quizzes for a subject
  const handleDeleteAllQuizzes = async (subject) => {
    try {
      const quizzesToDelete = quizzes.filter(quiz => quiz.subject === subject);
      for (const quiz of quizzesToDelete) {
        const quizRef = doc(db, 'quizzes', quiz.id);
        await deleteDoc(quizRef);
      }
      setQuizzes(quizzes.filter(quiz => quiz.subject !== subject));
      alert('All quizzes for this subject have been deleted.');
    } catch (err) {
      console.error('Error deleting quizzes:', err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Delete Quiz
      </Typography>

      {quizzes.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            Select a Quiz to Delete
          </Typography>
          <List>
            {quizzes.map(quiz => (
              <React.Fragment key={quiz.id}>
                <ListItem
                  button
                  onClick={() => setSelectedQuiz(quiz)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    bgcolor: selectedQuiz?.id === quiz.id ? 'primary.light' : 'transparent',
                    borderRadius: 1,
                  }}
                >
                  {quiz.quizName}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          {selectedQuiz && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="error">
                Are you sure you want to delete "{selectedQuiz.quizName}"?
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleDeleteQuiz}
                sx={{ mt: 2 }}
              >
                Delete Quiz
              </Button>
            </Box>
          )}

          <Typography variant="h6" sx={{ mt: 5 }}>
            Delete All Quizzes by Subject
          </Typography>
          <List>
            {[...new Set(quizzes.map(quiz => quiz.subject))].map(subject => (
              <React.Fragment key={subject}>
                <ListItem
                  button
                  onClick={() => handleDeleteAllQuizzes(subject)}
                  sx={{
                    bgcolor: 'secondary.light',
                    borderRadius: 1,
                  }}
                >
                  Delete All Quizzes for "{subject}"
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </>
      ) : (
        <Typography variant="body1" color="textSecondary">
          No quizzes available.
        </Typography>
      )}
    </Box>
  );
};

export default DeleteQuiz;
