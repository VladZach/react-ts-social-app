import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { cardSMFormValues } from "./ResetPassword";
import { ScepticGuyPageProps } from "./ScepticGuyPage";

export interface cardMDFormValues extends cardSMFormValues {
  password?: string;
}

export default function Login({
  setSubmissionError,
  setErrors,
  setGif,
}: ScepticGuyPageProps) {
  const { login } = useAuth();
  const history = useHistory();
  function validate(values: cardMDFormValues) {
    const errors: Array<string> = [];
    if (!values.email) {
      errors.push("Email is required");
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.push("Invalid email address");
    }
    if (!values.password) {
      errors.push("Password is required");
    } else if (values.password && values.password.length < 6) {
      errors.push("Password is shorter then 6 letters");
    }

    //Так как сообщения об ошибке находятся вне формы, храним их в состоянии и передаём пропсом
    setErrors(errors);
    if (errors.length) {
      setGif("rejecting-guy.gif");
      setTimeout(() => setGif("guy.gif"), 1250);
    }
    return errors;
  }

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validate={validate}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={async function (values, { setSubmitting }) {
        try {
          await login(values.email, values.password);
          history.push("/");
        } catch (e) {
          setSubmissionError("Failed to log in. Check your email and password");
        }
      }}
    >
      {() => (
        <Form noValidate className="card__form card__item form">
          <div className="form__item">
            <label className="form__label" htmlFor="email">
              Email
            </label>
            <Field
              className="form__input card__input form__input_textual-sm"
              type="email"
              name="email"
              autoComplete="off"
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
              className="form__input card__input form__input_textual-sm"
              type="password"
              name="password"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="form__error"
            />
          </div>
          <div className="form__footer">
            <Link className="button form__submit-button" to="/start-screen">
              back
            </Link>
            <button className="button form__submit-button" type="submit">
              enter
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
