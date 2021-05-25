import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { cardMDFormValues } from "./Login";

export interface cardLGFormValues extends cardMDFormValues {
  passwordConfirmation?: string;
}

export default function SignUp() {
  const { signup } = useAuth();

  const [submissionError, setSubmissionError] = useState("");

  const history = useHistory();

  function validate(values: cardLGFormValues) {
    const errors: cardLGFormValues = {};
    if (!values.email) {
      errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }
    if (!values.password) {
      errors.password = "Required";
    } else if (values.password && values.password.length < 6) {
      errors.password = "Password is shorter then 6 letters";
    }
    if (!values.passwordConfirmation) {
      errors.passwordConfirmation = "Required";
    } else if (values.passwordConfirmation !== values.password) {
      errors.passwordConfirmation = "Passwords doesn't match";
    }
    return errors;
  }

  const form = (
    <Formik
      initialValues={{ email: "", password: "", passwordConfirmation: "" }}
      validate={validate}
      onSubmit={async function (values) {
        try {
          await signup(values.email, values.password);
          history.push("/");
        } catch (e) {
          setSubmissionError(e.message);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="card__form card__item form">
          <div className="form__item">
            <label className="form__label" htmlFor="email">
              email:
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="email"
              name="email"
              autocomplete="off"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="form__error"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="password">
              password:
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="password"
              name="password"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="password">
              password confirmation:
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="password"
              name="passwordConfirmation"
            />
            {/* имя должно точно соответствовать имени свойства в объекте, то есть кэмэлКейс */}
          </div>

          <button className="button form__submit-button" type="submit">
            ENTER
          </button>
        </Form>
      )}
    </Formik>
  );

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
        <h2 className="card__item card__header">Sign Up</h2>
        {submissionError ? (
          <div className="form__error">{submissionError}</div>
        ) : (
          ""
        )}
        {form}
      </div>
    </div>
  );
}
