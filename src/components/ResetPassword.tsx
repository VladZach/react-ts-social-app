import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

//TODO: перенести интерфейс в восстановление пароля, там будет просто email,
//в остальных случаях наследоваться

export interface formValues {
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}

export default function SignUp() {
  //TODO: убрать any
  const { resetPassword }: any = useAuth();

  function validate(values: formValues) {
    const errors: formValues = {};
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
        resetPassword(values.email, values.password);
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
            <ErrorMessage name="email" component="div" />
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
        <h2 className="card__item card__header">Sign Up</h2>
        {form}
        <div className="card__footer card__item">
          Remembered password? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
