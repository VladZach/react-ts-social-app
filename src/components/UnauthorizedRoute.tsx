import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function UnathorizedRoute({
  component: Component,
  ...rest
}: any) {
  const { currentUser }: any = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        return currentUser ? (
          <Redirect to="/"></Redirect>
        ) : (
          <Component {...props}></Component>
        );
      }}
    ></Route>
  );
}
