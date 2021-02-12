import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import SignUp from "./SignUp";

function App() {
  return (
    <>
      <AuthProvider>
        <SignUp></SignUp>
      </AuthProvider>
    </>
  );
}

export default App;
