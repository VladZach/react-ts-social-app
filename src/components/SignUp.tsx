import React from "react";

export default function SignUp() {
  return (
    <div className="page page_centralized">
      <div className="card">
        <h2 className="card__item card__header">Sign Up</h2>
        <form className="card__form card__item form">
          <div className="form__item">
            <label className="form__label" htmlFor="email">
              Email
            </label>
            <input
              className="form__input form__input_textual-sm"
              name="email"
              type="email"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="password">
              Password
            </label>
            <input
              className="form__input form__input_textual-sm"
              name="password"
              type="password"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="password-confirmation">
              Email
            </label>
            <input
              className="form__input form__input_textual-sm"
              name="password-confirmation"
              type="password"
            />
          </div>
          <button className="button form__submit-button" type="submit">
            Sign Up
          </button>
        </form>
        <div className="card__footer card__item">
          <a>Already have an account?</a>
        </div>
      </div>
    </div>
  );
}
