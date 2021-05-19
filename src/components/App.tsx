import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import SignUp from "./SignUp";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import UserPage from "./UserPage";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import UpdateProfile from "./UpdateProfile";
import ResetPassword from "./ResetPassword";
import UnathorizedRoute from "./UnauthorizedRoute";
import UpdateCredentials from "./UpdateCredentials";
import Header from "./Header";

function App() {
  return (
    <>
      <Header></Header>
      <Router>
        <AuthProvider>
          <Switch>
            <PrivateRoute exact path="/" component={UserPage}></PrivateRoute>
            <UnathorizedRoute
              path="/signup"
              component={SignUp}
            ></UnathorizedRoute>
            <UnathorizedRoute
              path="/login"
              component={Login}
            ></UnathorizedRoute>
            <PrivateRoute
              path="/update-credentials"
              component={UpdateCredentials}
            ></PrivateRoute>
            <PrivateRoute
              path="/reset-password"
              component={ResetPassword}
            ></PrivateRoute>
            <PrivateRoute
              path="/update-profile"
              component={UpdateProfile}
            ></PrivateRoute>
          </Switch>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
