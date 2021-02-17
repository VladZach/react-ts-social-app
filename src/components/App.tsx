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

function App() {
  return (
    <>
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
            <UnathorizedRoute
              path="/update-profile"
              component={UpdateProfile}
            ></UnathorizedRoute>
            <Route path="/reset-password" component={ResetPassword}></Route>
          </Switch>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
