import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ component: Component, ...rest }: any) {
  const { currentUser }: any = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        return currentUser ? (
          <Component {...props}></Component>
        ) : (
          <Redirect to="/start-screen"></Redirect>
        );
      }}
    ></Route>
  );
}
