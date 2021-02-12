import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { formValues } from "./SignUp";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
  //TODO: убрать any
  const { login }: any = useAuth();
  const history = useHistory();
  const [submissionError, setSubmissionError] = useState("");

  function validate(values: formValues) {
    const errors: formValues = {};
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
          <ErrorMessage name="serverResponse" component="div" />
          <div className="form__item">
            <label className="form__label" htmlFor="email">
              Email
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="email"
              name="email"
            />
            <ErrorMessage name="email" component="div" />
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
            <ErrorMessage name="password" component="div" />
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
          Need an account? <Link to="/signup">Sign in</Link>
          <Link to="/reset-password">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
