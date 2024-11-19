import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./Components/Signup.jsx";
import Login from "./Components/Login.jsx";
import Homepage from "./Components/Homepage.jsx";


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for the sign-up page */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/homepage" element={<Homepage />} />

      </Routes>
    </Router>
  );
};

export default App;
