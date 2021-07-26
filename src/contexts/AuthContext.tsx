import firebase from "firebase/compat/app";
import React, { useContext, useState, useEffect, ReactChild } from "react";
import { auth } from "../firebase";

const AuthContext = React.createContext<null | AuthContextValue>(null);

export function useAuth(): AuthContextValue {
  return useContext(AuthContext) as AuthContextValue;
}

interface Props {
  children: ReactChild;
}

export interface AuthContextValue {
  currentUser: firebase.User | null;
  signup: (
    email: string,
    password: string
  ) => Promise<firebase.auth.UserCredential>;
  login: (
    email: string,
    password: string
  ) => Promise<firebase.auth.UserCredential>;
  reauthenticate: (
    password: string
  ) => Promise<firebase.auth.UserCredential> | null;
  logout: () => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<null | firebase.User>(null);
  //for initial loading of user
  const [loading, setLoading] = useState(true);

  function signup(email: string, password: string) {
    return auth.createUserWithEmailAndPassword(email, password);
  }
  //если я захочу использовать что-то кроме firebase, мне достаточно просто изменить эти методы
  //(ну и интерфейс, да)
  function login(email: string, password: string) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function reauthenticate(password: string) {
    const user = firebase.auth().currentUser;
    if (user !== null) {
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email!,
        password
      );
      // Now you can use that to reauthenticate
      return user.reauthenticateWithCredential(credential);
    }
    return null;
  }

  function logout() {
    return auth.signOut();
  }

  function updateEmail(email: string) {
    return currentUser!.updateEmail(email);
  }

  function updatePassword(password: string) {
    return currentUser!.updatePassword(password);
  }

  function resetPassword(email: string) {
    return auth.sendPasswordResetEmail(email);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  //надо ли всему этому присваивать типы явно?

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updatePassword,
    updateEmail,
    resetPassword,
    reauthenticate,
  };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
