import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ScepticGuyPageProps } from "./ScepticGuyPage";

export interface cardSMFormValues {
  email?: string | null;
}

export default function SignUp({
  setSubmissionError,
  setErrors,
  setGif,
}: ScepticGuyPageProps) {
  const { resetPassword } = useAuth();

  function validate(values: cardSMFormValues) {
    const errors: Array<string> = [];
    if (!values.email) {
      errors.push("Email is required");
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.push("Invalid email address");
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
      initialValues={{ email: "" }}
      validate={validate}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={async function (values) {
        try {
          await resetPassword(values.email);
        } catch (e) {
          setSubmissionError(e.message);
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
}
