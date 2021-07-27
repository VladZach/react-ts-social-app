import React from "react";
import { Formik, Form, Field } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { cardMDFormValues } from "./Login";
import { ScepticGuyPageProps } from "./ScepticGuyPage";

export default function Reauthenticate({
  setGif,
  setSubmissionError,
  setErrors,
}: ScepticGuyPageProps) {
  const { reauthenticate, currentUser } = useAuth();

  const history = useHistory();

  function validate(values: cardMDFormValues) {
    const errors: Array<string> = [];

    if (!values.password) {
      errors.push("Password is required");
    } else if (values.password && values.password.length < 6) {
      errors.push("Password is shorter then 6 letters");
    }

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
        initialValues={{ password: "" }}
        validateOnBlur={false}
        validateOnChange={false}
        validate={validate}
        onSubmit={async function (values) {
          try {
            await reauthenticate(values.password!);
            history.push("/update-profile");
          } catch (e) {
            if (e.code === "auth/wrong-password") {
              setSubmissionError("Password is incorrect");
            } else {
              setSubmissionError(e.message);
            }
          }
        }}
      >
        {() => (
          <Form noValidate className="card__form card__item form">
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
