import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";

//TODO: перенести интерфейс в восстановление пароля, там будет просто email,
//в остальных случаях наследоваться

export interface formValues {
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}

export default function SignUp() {
  //TODO: убрать any
  const { updateEmail, updatePassword, currentUser }: any = useAuth();

  const history = useHistory();

  function validate(values: formValues) {
    const errors: formValues = {};
    if (!values.email) {
      errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }
    if (values.password && values.password.length < 6) {
      errors.password = "Password is shorter then 6 letters";
    }
    if (!values.passwordConfirmation && values.password) {
      errors.passwordConfirmation = "Required";
    } else if (values.passwordConfirmation !== values.password) {
      errors.passwordConfirmation = "Passwords doesn't match";
    }
    return errors;
  }

  const form = (
    <Formik
      initialValues={{
        email: currentUser.email,
        password: "",
        passwordConfirmation: "",
      }}
      validate={validate}
      onSubmit={async function (values, { setSubmitting }) {
        const promises = [];
        if (values.email !== currentUser.email) {
          promises.push(updateEmail(values.email));
        }
        if (values.password) {
          promises.push(updatePassword(values.password));
        }
        await Promise.all(promises);
        history.push("/");
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
          <div className="form__item">
            <label className="form__label" htmlFor="password">
              Password
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="password"
              name="password"
              placeholder="Leave blank to save old password"
            />
            <ErrorMessage name="password" component="div" />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="password">
              Password Confirmation
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="password"
              name="passwordConfirmation"
              placeholder="Leave blank to save old password"
            />
            {/* имя должно точно соответствовать имени свойства в объекте, то есть кэмэлКейс */}
            <ErrorMessage name="passwordConfirmation" component="div" />
          </div>

          <button className="button form__submit-button" type="submit">
            Update
          </button>
        </Form>
      )}
    </Formik>
  );

  return (
    <div className="page page_centralized">
      <div className="card">
        <h2 className="card__item card__header">Update profile</h2>
        {form}
        <div className="card__footer card__item">
          <Link to="/">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
