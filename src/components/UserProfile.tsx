import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function UserProfile() {
  const { currentUser, logout }: any = useAuth();

  return (
    <div className="user-profile">
      <img
        src="./avatar.jpg"
        className="user-avatar user-profile__avatar stone-bordered"
      ></img>
      <div className="user-info user-profile__info stone-bordered">
        <div className="user-info__header">
          <h3 className="user-name user-info__name">Ваня Петров</h3>
          <div className="user-profile__controls controls">
            <span className="controls__button" onClick={logout}>
              log out
            </span>
            <Link to="/update-profile" className="controls__button">
              edit
            </Link>
          </div>
        </div>
        <div className="user-text user-info__text">
          <span className="user-text__header">from:</span>
          <span className="user-text__text">Cherepovets</span>
        </div>
        <div className="user-text user-info__text">
          <span className="user-text__header">about me:</span>
          <span className="user-text__text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </span>
        </div>
      </div>
    </div>
  );
}
