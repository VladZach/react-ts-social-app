import { getDatabase, get, ref } from "firebase/database";
import React from "react";
import { useState, useEffect } from "react";
import { RouteComponentProps, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "./Loader";
import UserProfile from "./UserProfile";
import Wall from "./Wall";
import { getUserData } from "./UserProfile";

export default function UserPage() {
  const { currentUser, logout }: any = useAuth();
  interface RouteParams {
    userId: string;
  }
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [userId] = useState(useParams<any>().id || currentUser!.uid);

  useEffect(() => {
    getUserData(userId).then((snapshot) => setUserData(snapshot.val()));
  }, [userId]);

  useEffect(() => {
    if (userData) {
      setIsLoading(false);
    }
  }, [userData]);

  return (
    <div className="page page_centralized container">
      {isLoading ? (
        <Loader></Loader>
      ) : (
        <>
          <UserProfile userId={userId} {...userData}></UserProfile>
          <Wall userId={userId} {...userData}></Wall>
        </>
      )}
    </div>
  );
}
