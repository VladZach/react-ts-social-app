import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { getDatabase, ref, update, get } from "firebase/database";
import Loader from "./Loader";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import TextareaAutosize from "react-textarea-autosize";
import { ScepticGuyPageProps } from "./ScepticGuyPage";

export default function UpdateProfile({
  setGif,
  setSubmissionError,
  setErrors,
}: ScepticGuyPageProps) {
  const { currentUser, updateEmail, updatePassword } = useAuth();

  const history = useHistory();

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<userProfileValues | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null | ArrayBuffer>(
    null
  );
  const db = getDatabase();

  interface userProfileValues {
    [index: string]: string | File | undefined;
    email: string;
    firstName: string;
    lastName: string;
    whereFrom: string;
    password: string;
    passwordConfirmation: string;
    photo: File | undefined;
    aboutMe: string;
  }

  function getFullUserData() {
    const userRef = ref(db, "users/" + currentUser!.uid);
    const data: userProfileValues = {
      email: currentUser?.email!,
      firstName: "",
      lastName: "",
      whereFrom: "",
      password: "",
      passwordConfirmation: "",
      photo: undefined,
      aboutMe: "",
    };
    return get(userRef).then((snapshot) => {
      let values = snapshot.val();
      for (let key of Object.keys(values)) {
        if (key === "fullName") {
          const [firstName, lastName] = values[key].split(" ");
          data.firstName = firstName ? firstName : "";
          data.lastName = lastName ? lastName : "";
        } else {
          data[key] = values[key];
        }
      }
      for (const key of Object.keys(data)) {
        if (localStorage.getItem(key)) {
          data[key] = localStorage.getItem(key)!;
        }
      }
      setUserData(data);
    });
  }

  useEffect(() => {
    getFullUserData()
      .catch((e) => console.error("An error occured:" + e))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function validate(values: userProfileValues) {
    const errors: Array<string> = [];
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!values.email) {
      errors.push("Email is required");
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.push("Invalid email address");
    }
    if (values.password && values.password.length < 6) {
      errors.push("Password is shorter then 6 letters");
    }
    if (values.photo && !allowedImageTypes.includes(values.photo.type)) {
      errors.push("Only png, img and gif formats are supported");
    }
    if (values.password && !values.passwordConfirmation) {
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
      initialValues={userData!}
      validate={validate}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={async function (values) {
        try {
          const promises = [];
          let photoUrl = "";
          //если есть фото, загружаем его в storage. Url для загрузки записываем в photoUrl юзеру

          if (values.email !== currentUser!.email) {
            promises.push(updateEmail(values.email!));
          }
          if (values.password) {
            promises.push(updatePassword(values.password));
          }

          await Promise.all(promises);

          if (values.photo) {
            const storage = getStorage();
            const photoRef = storageRef(
              storage,
              "UserProfilePictures/" + currentUser!.uid
            );
            await uploadBytes(photoRef, values.photo);
            await getDownloadURL(photoRef).then((url) => {
              photoUrl = url;
            });
          }

          const userRef = ref(db, "users/" + currentUser!.uid);
          const { firstName, lastName, aboutMe, whereFrom } = values;
          const userObj = {
            fullName:
              `${firstName.toLowerCase()} ${lastName.toLowerCase()}`.trim(),
            photoUrl: photoUrl,
            aboutMe: aboutMe,
            whereFrom: whereFrom,
          };
          await update(userRef, userObj);

          for (const key of Object.keys(userData!)) {
            localStorage.removeItem(key);
          }

          history.push("/");
        } catch (e) {
          if (e.code === "auth/requires-recent-login") {
            //если надо реавторизироваться - сохраняем введённые значение в ls
            for (const [key, value] of Object.entries(values)) {
              localStorage.setItem(key, value as string);
            }
            history.push("/reauthenticate");
          }
          setSubmissionError(e.message);
        }
      }}
    >
      {({ setFieldValue }) => (
        <Form className="card__form card__item form">
          <div className="form__item">
            <label className="form__label" htmlFor="email">
              Email
            </label>
            <Field
              className="form__input card__input form__input_textual-sm"
              type="text"
              name="email"
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
          <div className="form__item">
            <label className="form__label" htmlFor="firstName">
              Firstname
            </label>
            <Field
              className="form__input card__input form__input_textual-sm"
              type="text"
              name="firstName"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="lastName">
              Lastname
            </label>
            <Field
              className="form__input card__input form__input_textual-sm"
              type="text"
              name="lastName"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="photo">
              Photo
            </label>
            <input
              type="file"
              onChange={(event) => {
                setFieldValue("photo", event.currentTarget.files![0]);
                let reader = new FileReader();
                let file = event.currentTarget.files![0];
                reader.onloadend = () => {
                  setPhotoPreview(reader.result);
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>
          {photoPreview ? <img src={photoPreview as string} /> : null}
          <div className="form__item">
            <label className="form__label" htmlFor="aboutMe">
              About Me
            </label>
            <Field
              as={TextareaAutosize}
              maxRows="4"
              className="form__input card__input form__input_textual-sm"
              name="aboutMe"
            />
          </div>
          <div className="form__item">
            <label className="form__label" htmlFor="whereFrom">
              Where from
            </label>
            <Field
              className="form__input card__input form__input_textual-sm"
              type="text"
              name="whereFrom"
            />
          </div>
          <button
            className="button form__submit-button"
            onClick={() => history.push("/")}
          >
            Back
          </button>
          <button className="button form__submit-button" type="submit">
            Update
          </button>
        </Form>
      )}
    </Formik>
  );

  return isLoading ? <Loader></Loader> : form;
}
