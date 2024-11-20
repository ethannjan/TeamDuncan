import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Firestore instance
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import {
  Button,
  Box,
  Typography,
  List,
  ListItem,
  Divider,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const DeleteQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(''); // 'individual' or 'subject'

  const commonStyles = {
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      bgcolor: 'background.paper',
      borderRadius: 1,
      p: 2,
      mb: 1,
    },
    button: {
      mt: 2,
      borderRadius: 2,
    },
    deleteSection: {
      mt: 3,
      textAlign: 'center',
    },
  };

  // Fetch quizzes from Firestore
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        const quizzesData = querySnapshot.docs.map((doc) => ({
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
      setQuizzes(quizzes.filter((quiz) => quiz.id !== selectedQuiz.id));
      setSelectedQuiz(null);
      setConfirmOpen(false);
      alert('Quiz deleted successfully!');
    } catch (err) {
      console.error('Error deleting quiz:', err);
    }
  };

  // Confirm and delete all quizzes for a subject
  const handleDeleteAllQuizzes = async () => {
    try {
      const quizzesToDelete = quizzes.filter((quiz) => quiz.subject === subjectToDelete);
      for (const quiz of quizzesToDelete) {
        const quizRef = doc(db, 'quizzes', quiz.id);
        await deleteDoc(quizRef);
      }
      setQuizzes(quizzes.filter((quiz) => quiz.subject !== subjectToDelete));
      setSubjectToDelete(null);
      setConfirmOpen(false);
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
            {quizzes.map((quiz) => (
              <Paper
                key={quiz.id}
                elevation={2}
                sx={{
                  ...commonStyles.listItem,
                  bgcolor: selectedQuiz?.id === quiz.id ? 'primary.light' : 'background.paper',
                }}
              >
                <ListItem
                  button
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    setDeleteType('individual');
                    setConfirmOpen(true);
                  }}
                >
                  {quiz.quizName}
                </ListItem>
              </Paper>
            ))}
          </List>

          <Typography variant="h6" sx={{ mt: 5 }}>
            Delete All Quizzes by Subject
          </Typography>
          <List>
            {[...new Set(quizzes.map((quiz) => quiz.subject))].map((subject) => (
              <Paper key={subject} elevation={2} sx={commonStyles.listItem}>
                <ListItem
                  button
                  onClick={() => {
                    setSubjectToDelete(subject);
                    setDeleteType('subject');
                    setConfirmOpen(true);
                  }}
                >
                  Delete All Quizzes for "{subject}"
                </ListItem>
              </Paper>
            ))}
          </List>

          {/* Confirmation Dialog */}
          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {deleteType === 'individual' && selectedQuiz && (
                  <>
                    Are you sure you want to delete the quiz "{selectedQuiz.quizName}"? This action
                    cannot be undone.
                  </>
                )}
                {deleteType === 'subject' && subjectToDelete && (
                  <>
                    Are you sure you want to delete all quizzes for the subject "{subjectToDelete}"?
                    This action cannot be undone.
                  </>
                )}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)} color="primary">
                Cancel
              </Button>
              <Button
                onClick={deleteType === 'individual' ? handleDeleteQuiz : handleDeleteAllQuizzes}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
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
