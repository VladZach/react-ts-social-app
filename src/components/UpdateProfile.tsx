import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";

export default function UpdateProfile() {
  const { currentUser } = useAuth();

  const history = useHistory();

  interface userProfileValues {
    nickName?: string;
    photo?: File;
    aboutMe?: string;
  }

  function showImagePreview() {}

  function validate(values: userProfileValues) {
    const errors: userProfileValues = {};
    if (!values.nickName) {
      errors.nickName = "Required";
    } else if (values.nickName.length > 4) {
      errors.nickName = "Nickname is shorter than 4 letters";
    }
    //@TODO проверять, не занят ли ник уже
    return errors;
  }

  const form = (
    <Formik
      initialValues={{
        nickName: "",
        photo: undefined,
        aboutMe: "",
      }}
      validate={validate}
      onSubmit={async function (values, { setSubmitting }) {
        const promises = [];

        history.push("/");
      }}
    >
      {({ isSubmitting }) => (
        <Form className="card__form card__item form">
          <div className="form__item">
            <label className="form__label" htmlFor="nickname">
              Nickname
            </label>
            <Field
              className="form__input form__input_textual-sm"
              type="text"
              name="nickname"
              placeholder="Nickname should be at least 4 letters long"
            />
            <ErrorMessage
              name="nickname"
              component="div"
              className="form__error"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="photo">
              Photo
            </label>
            <input type="file"></input>
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="aboutMe">
              About Me
            </label>
            <Field
              className="form__input form__input_textual-sm"
              component="textarea"
              name="aboutMe"
              placeholder="Tell a bit about yourself"
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
