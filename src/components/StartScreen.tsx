import React from "react";
import { Link } from "react-router-dom";

export default function StartScreen() {
  return (
    <>
      <Link className="card__item card__link" to="/login">
        <span className="card__item_with-hand">Log In</span>
      </Link>
      <Link className="card__item card__link" to="/signup">
        <span className="card__item_with-hand">Sign Up</span>
      </Link>
      <Link className="card__item card__link" to="/reset-password">
        <span className="card__item_with-hand">Reset Password</span>
      </Link>
    </>
  );
}
