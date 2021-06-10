import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import WelcomePage from "./WelcomePage";

export interface cardSMFormValues {
  email?: string;
}

export default function SignUp() {
  const { resetPassword } = useAuth();
  const [submissionError, setSubmissionError] = useState("");
  const [errors, setErrors] = useState<Array<string>>([]);
  function validate(values: cardSMFormValues) {
    setErrors([]);
    if (!values.email) {
      setErrors((errors) => [...errors, "Email is required"]);
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      setErrors((errors) => [...errors, "Invalid email address"]);
    }
    return errors;
  }

  const form = (
    <Formik
      initialValues={{ email: "" }}
      validate={validate}
      onSubmit={async function (values) {
        try {
          await resetPassword(values.email);
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
          <div className="form__footer">
            <Link className="button form__submit-button" to="/start-screen">
              back
            </Link>
            <button className="button form__submit-button" type="submit">
              reset
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );

  return (
    <WelcomePage
      form={form}
      submissionError={submissionError}
      errors={errors}
      gif="guy.gif"
    ></WelcomePage>
  );
}
