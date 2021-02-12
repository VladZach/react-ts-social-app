import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import SignUp from "./SignUp";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import UserPage from "./UserPage";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Switch>
            <PrivateRoute exact path="/" component={UserPage}></PrivateRoute>
            <Route path="/signup" component={SignUp}></Route>
            <Route path="/login" component={Login}></Route>
          </Switch>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
