import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { cardSMFormValues } from "./ResetPassword";

export interface cardMDFormValues extends cardSMFormValues {
  password?: string;
}

export default function Login() {
  const { login } = useAuth();
  const history = useHistory();
  const [submissionError, setSubmissionError] = useState("");

  function validate(values: cardMDFormValues) {
    const errors: cardMDFormValues = {};
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
    return errors;
  }

  const form = (
    <Formik
      initialValues={{ email: "", password: "" }}
      validate={validate}
      onSubmit={async function (values, { setSubmitting }) {
        try {
          await login(values.email, values.password);
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
          <button className="button form__submit-button" type="submit">
            Log in
          </button>
        </Form>
      )}
    </Formik>
  );

  return (
    <div className="page page_centralized">
      <div className="card">
        <h2 className="card__item card__header">Log in</h2>
        {submissionError ? <div>{submissionError}</div> : ""}
        {form}
        <div className="card__footer card__item">
          <div className="card__footer_link">
            Need an account? <Link to="/signup">Sign in</Link>
          </div>
          <div className="card__footer_link">
            <Link to="/reset-password">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
