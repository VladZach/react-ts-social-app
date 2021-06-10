import React from "react";
import { useAuth } from "../contexts/AuthContext";
import UserProfile from "./UserProfile";
import Wall from "./Wall";

export default function UserPage() {
  const { currentUser, logout }: any = useAuth();
  return (
    <div className="page page_centralized container">
      <UserProfile></UserProfile>
      <Wall></Wall>
    </div>
  );
}
