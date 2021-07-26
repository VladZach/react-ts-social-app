import React, { ReactChild } from "react";
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
import Chats from "./Chats";
import StartScreen from "./StartScreen";
import SearchPeople from "./SearchPeople";
import Chat from "./Chat";
import ScepticGuyPage from "./ScepticGuyPage";
import Reauthenticate from "./Reauthenticate";
import News from "./News";

function App() {
  const signUp = () => {
    return (
      <ScepticGuyPage
        child={SignUp}
        heading="Sign up"
        hasHeader={true}
      ></ScepticGuyPage>
    );
  };

  const login = () => {
    return (
      <ScepticGuyPage
        child={Login}
        heading="Log in"
        hasHeader={true}
      ></ScepticGuyPage>
    );
  };

  const resetPassword = () => {
    return (
      <ScepticGuyPage
        child={ResetPassword}
        heading="Reset password"
        hasHeader={true}
      ></ScepticGuyPage>
    );
  };

  const startScreen = () => {
    return (
      <ScepticGuyPage
        child={StartScreen}
        heading="Choose your path"
        hasHeader={true}
      ></ScepticGuyPage>
    );
  };

  const updateProfile = () => {
    return (
      <ScepticGuyPage
        child={UpdateProfile}
        heading="Update profile"
        hasHeader={false}
      ></ScepticGuyPage>
    );
  };

  const reauthenticate = () => {
    return (
      <ScepticGuyPage
        child={Reauthenticate}
        heading="reathenticate"
        hasHeader={false}
      ></ScepticGuyPage>
    );
  };

  return (
    <>
      <Router>
        <Header></Header>
        <AuthProvider>
          <Switch>
            <PrivateRoute
              exact
              path="/"
              key="current-user"
              component={UserPage}
            ></PrivateRoute>

            <UnathorizedRoute
              path="/start-screen"
              component={startScreen}
            ></UnathorizedRoute>
            <UnathorizedRoute
              path="/signup"
              component={signUp}
            ></UnathorizedRoute>
            <UnathorizedRoute
              path="/login"
              component={login}
            ></UnathorizedRoute>
            <PrivateRoute
              path="/update-credentials"
              component={UpdateCredentials}
            ></PrivateRoute>
            <PrivateRoute
              path="/reauthenticate"
              component={reauthenticate}
            ></PrivateRoute>
            <UnathorizedRoute
              path="/reset-password"
              component={resetPassword}
            ></UnathorizedRoute>
            <PrivateRoute
              path="/update-profile"
              component={updateProfile}
            ></PrivateRoute>
            <PrivateRoute path="/news" component={News}></PrivateRoute>
            <PrivateRoute path="/chats" component={Chats}></PrivateRoute>
            <PrivateRoute
              path="/search-people"
              component={SearchPeople}
            ></PrivateRoute>

            <PrivateRoute
              path="/chat/:interlocutorId"
              component={Chat}
            ></PrivateRoute>
            <PrivateRoute
              path="/:id"
              key="other-user"
              component={UserPage}
            ></PrivateRoute>
          </Switch>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
