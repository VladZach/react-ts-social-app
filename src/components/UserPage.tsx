import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function UserPage() {
  const { currentUser, logout }: any = useAuth();
  return (
    <div className="page page_centralized">
      <div className="card">
        <h2 className="card__item card__header">
          {JSON.stringify(currentUser.email)}
        </h2>
        <button className="button form__submit-button">Update account</button>
        <button onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
