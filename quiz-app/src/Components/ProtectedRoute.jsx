import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { UserRoleContext } from './App'; // Assuming you have context to check role

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const userRole = useContext(UserRoleContext);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Redirect to="/" />; // Redirect to homepage if user role doesn't match allowed roles
  }

  return <Route {...rest} component={Component} />;
};

<ProtectedRoute
  path="/teacher-dashboard"
  component={TeacherDashboard}
  allowedRoles={['teacher']}
/>

export default ProtectedRoute;
