import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { cardMDFormValues } from "./Login";
import WelcomePage from "./WelcomePage";

export interface cardLGFormValues extends cardMDFormValues {
  passwordConfirmation?: string;
}

export default function SignUp() {
  const { signup } = useAuth();

  const [submissionError, setSubmissionError] = useState("");
  const [gif, setGif] = useState("guy.gif");
  const [errors, setErrors] = useState<Array<string>>([]);
  const history = useHistory();
  function validate(values: cardLGFormValues) {
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
    if (!values.passwordConfirmation) {
      errors.push("Password confirmation is required");
    } else if (values.passwordConfirmation !== values.password) {
      errors.push("Passwords doesn't match");
    }
    //Так как сообщения об ошибке находятся вне формы, храним их в состоянии и передаём пропсом
    setErrors(errors);
    if (errors.length) {
      setGif("rejecting-guy.gif");
      setTimeout(() => setGif("guy.gif"), 1250);
    }
    return errors;
  }

  const form = (
    <Formik
      initialValues={{ email: "", password: "", passwordConfirmation: "" }}
      validateOnBlur={false}
      validateOnChange={false}
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
        <Form noValidate className="card__form card__item form">
          <div className="form__item">
            <label className="form__label" htmlFor="email">
              email:
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="email"
              name="email"
              autoComplete="off"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="password">
              password:
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="password"
              name="password"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="password">
              password again:
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="password"
              name="passwordConfirmation"
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

  return (
    <WelcomePage
      gif={gif}
      form={form}
      submissionError={submissionError}
      errors={errors}
    ></WelcomePage>
  );
}
