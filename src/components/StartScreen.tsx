import React from "react";
import { Link } from "react-router-dom";
import WelcomePage from "./WelcomePage";

export default function StartScreen() {
  return (
    <div className="page page_welcome-page page_centralized container">
      <div className="welcome-page-header">
        <h1 className="welcome-page-header__large-text">Another Social App</h1>
        <p className="welcome-page-header__small-text">for portfolio</p>
      </div>

      <div className="sceptic-guy">
        <div className="thought-bubble sceptic-guy__thought-bubble">
          <div className="thought-bubble__body">
            <span className="thought-bubble__text">...really?</span>
          </div>
          <div className="thought-bubble__decoration-black"></div>
          <div className="thought-bubble__decoration-white"></div>
        </div>
        <img className="sceptic-guy__image" src="./guy.gif" />
      </div>
      <div className="card">
        <h2 className="card__item card__header">Choose your path</h2>
        <Link className="card__item card__link" to="/login">
          <span className="card__item_with-hand">Log In</span>
        </Link>
        <Link className="card__item card__link" to="/signup">
          <span className="card__item_with-hand">Sign Up</span>
        </Link>
        <Link className="card__item card__link" to="/reset-password">
          <span className="card__item_with-hand">Reset Password</span>
        </Link>
      </div>
    </div>
  );
}
