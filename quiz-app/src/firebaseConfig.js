// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Consolidated import
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"; // Included all firestore imports in one line

const firebaseConfig = {
  apiKey: "AIzaSyDEOZjPTjneq_QaV35SUX2PS-I_6ySErZs",
  authDomain: "quiz-f3a77.firebaseapp.com",
  projectId: "quiz-f3a77",
  storageBucket: "quiz-f3a77.appspot.com",
  messagingSenderId: "514556997957",
  appId: "1:514556997957:web:9a0c1e76268857f43a0e2c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// The onAuthStateChanged listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid); // Assuming 'users' collection
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const role = userData.role; // teacher or student
      // You can now use this role in your state/context
      // Example: setUserRole(role);
    }
  }
});

// SignUp handler function
const handleSignUp = async (email, password, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data in Firestore, including role
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      role: role, // Assign the role (either teacher or student)
    });

    console.log("User registered with role:", role);
  } catch (error) {
    console.error("Error signing up:", error.message);
  }
};

const handleSaveQuiz = async () => {
  try {
    // Create a new document reference for the quiz in Firestore
    const quizRef = doc(collection(db, 'quizzes'));

    // Quiz data including name, subject, and questions with options
    const quizData = {
      quizName,
      subject,
      questions: questions.map((question) => ({
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options.map((option) => ({
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      })),
    };

    // Save the quiz to Firestore
    await setDoc(quizRef, quizData);

    alert('Quiz saved successfully');
  } catch (error) {
    console.error('Error saving quiz: ', error);
    alert('Error saving quiz');
  }
};
