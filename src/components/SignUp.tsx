import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { cardMDFormValues } from "./Login";

interface cardLGFormValues extends cardMDFormValues {
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
              Email
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="email"
              name="email"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="form__error"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="password">
              Password
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="password"
              name="password"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="form__error"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="password">
              Password Confirmation
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="password"
              name="passwordConfirmation"
            />
            {/* имя должно точно соответствовать имени свойства в объекте, то есть кэмэлКейс */}
            <ErrorMessage
              name="passwordConfirmation"
              component="div"
              className="form__error"
            />
          </div>

          <button className="button form__submit-button" type="submit">
            Sign Up
          </button>
        </Form>
      )}
    </Formik>
  );

  return (
    <div className="page page_centralized">
      <div className="card">
        <h2 className="card__item card__header">Sign Up</h2>
        {submissionError ? (
          <div className="form__error">{submissionError}</div>
        ) : (
          ""
        )}
        {form}
        <div className="card__footer card__item">
          Already have an account?&nbsp;<Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
