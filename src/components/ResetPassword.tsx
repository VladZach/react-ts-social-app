import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export interface cardSMFormValues {
  email?: string;
}

export default function SignUp() {
  const { resetPassword } = useAuth();

  function validate(values: cardSMFormValues) {
    const errors: cardSMFormValues = {};
    if (!values.email) {
      errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }
    return errors;
  }

  const form = (
    <Formik
      initialValues={{ email: "" }}
      validate={validate}
      onSubmit={(values, { setSubmitting }) => {
        resetPassword(values.email);
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

          <button className="button form__submit-button" type="submit">
            Reset
          </button>
        </Form>
      )}
    </Formik>
  );

  return (
    <div className="page page_centralized">
      <div className="card">
        <h2 className="card__item card__header">Reset Password</h2>
        {form}
        <div className="card__footer card__item">
          Remembered password?&nbsp;<Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
