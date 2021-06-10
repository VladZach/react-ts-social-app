import React, { ReactChild } from "react";
import { cardLGFormValues } from "./SignUp";

interface Props {
  form: ReactChild;
  submissionError: string;
  errors: Array<string>;
  gif: string;
}

export default function WelcomePage({
  form,
  submissionError,
  errors,
  gif,
}: Props) {
  return (
    <div className="page page_welcome-page page_centralized container">
      <div className="welcome-page-header">
        <h1 className="welcome-page-header__large-text">Another Social App</h1>
        <p className="welcome-page-header__small-text">for portfolio</p>
      </div>

      <div className="sceptic-guy">
        <div className="thought-bubble sceptic-guy__thought-bubble">
          <div className="thought-bubble__body">
            <span className="thought-bubble__text">
              {submissionError
                ? submissionError
                : errors.length
                ? errors.join(" & ")
                : "...really?"}
            </span>
          </div>
          <div className="thought-bubble__decoration-black"></div>
          <div className="thought-bubble__decoration-white"></div>
        </div>
        <img className="sceptic-guy__image" src={`./${gif}`} />
      </div>
      <div className="card">
        <h2 className="card__item card__header">Sign Up</h2>

        {form}
      </div>
    </div>
  );
}
