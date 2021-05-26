import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { cardSMFormValues } from "./ResetPassword";
import WelcomePage from "./WelcomePage";

export interface cardMDFormValues extends cardSMFormValues {
  password?: string;
}

export default function Login() {
  const { login } = useAuth();
  const history = useHistory();
  const [submissionError, setSubmissionError] = useState("");
  const [errors, setErrors] = useState<Array<string>>([]);
  function validate(values: cardMDFormValues) {
    setErrors([]);
    if (!values.email) {
      setErrors((errors) => [...errors, "Email is required"]);
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      setErrors((errors) => [...errors, "Invalid email address"]);
    }
    if (!values.password) {
      setErrors((errors) => [...errors, "Password is required"]);
    } else if (values.password && values.password.length < 6) {
      setErrors((errors) => [...errors, "Password is shorter then 6 letters"]);
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
          setSubmissionError("Failed to log in. Check your email and password");
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
            enter
          </button>
        </Form>
      )}
    </Formik>
  );

  return (
    <WelcomePage
      form={form}
      submissionError={submissionError}
      errors={errors}
    ></WelcomePage>
  );
}
