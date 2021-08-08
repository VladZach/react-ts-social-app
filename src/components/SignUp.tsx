import React from "react";
import { Formik, Form, Field } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { cardMDFormValues } from "./Login";
import { getDatabase, increment, ref, set } from "firebase/database";
import { ScepticGuyPageProps } from "./ScepticGuyPage";

export interface cardLGFormValues extends cardMDFormValues {
  passwordConfirmation?: string;
}

export default function SignUp({
  setGif,
  setSubmissionError,
  setErrors,
}: ScepticGuyPageProps) {
  const { signup, currentUser } = useAuth();

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

  return (
    <>
      <Formik
        initialValues={{ email: "", password: "", passwordConfirmation: "" }}
        validateOnBlur={false}
        validateOnChange={false}
        validate={validate}
        onSubmit={async function (values) {
          try {
            const { user } = await signup(values.email, values.password);
            const db = getDatabase();
            const usersCounterRef = ref(db, "counters/users/");
            const userRef = ref(db, "users/" + user!.uid);
            const userObj = {
              fullName: "",
              photoUrl: "",
              aboutMe: "",
              whereFrom: "",
            };

            await set(userRef, userObj);
            await set(usersCounterRef, increment(1));
            history.push("/update-profile");
          } catch (e) {
            setSubmissionError(e.message);
          }
        }}
      >
        {() => (
          <Form noValidate className="card__form card__item form">
            <div className="form__item">
              <label className="form__label" htmlFor="email">
                email:
              </label>
              <Field
                className="form__input card__input form__input_textual-sm"
                type="email"
                name="email"
                autoComplete="off"
              />
            </div>
            <div className="form__item">
              <label className="form__label" htmlFor="password">
                Password:
              </label>
              <Field
                className="form__input card__input form__input_textual-sm"
                type="password"
                name="password"
              />
            </div>
            <div className="form__item">
              <label className="form__label" htmlFor="password">
                Password again:
              </label>
              <Field
                className="form__input card__input form__input_textual-sm"
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
    </>
  );
}
