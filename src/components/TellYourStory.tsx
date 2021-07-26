import React, { useRef, useState } from "react";
import { Formik, Form, Field } from "formik";
import {
  getDatabase,
  ref,
  set,
  serverTimestamp,
  push,
  get,
} from "firebase/database";
import { useAuth } from "../contexts/AuthContext";

export function computeOffset(element: HTMLElement, container: HTMLElement) {
  //получаем отступ, который должен быть с обеих сторон element для центровки
  const destinationOffset = (container.offsetWidth - element.offsetWidth) / 2;
  //получаем смещение для центровки element относительно его текущей позиции
  const offset = -(element.offsetLeft - destinationOffset);
  return offset;
}

export default function TellYourStory() {
  const { currentUser }: any = useAuth();

  const [isTelling, setIsTelling] = useState(false);
  const [inputHasValue, setInputHasValue] = useState(false);

  const form = useRef<HTMLFormElement>(null);
  const textAreaLabel = useRef<HTMLSpanElement>(null);
  const textArea = useRef<HTMLTextAreaElement>(null);

  async function writePost(text: string) {
    const db = getDatabase();
    const postListRef = ref(db, "posts/");
    const subscribersListRef = ref(
      db,
      "users/" + currentUser.uid + "/subscribers/"
    );

    const newPostRef = await push(postListRef);
    let key = newPostRef.key;
    await set(newPostRef, {
      text: text,
      createdAt: serverTimestamp(),
      author: currentUser.uid,
    });
    await set(ref(db, "users/" + currentUser.uid + "/posts/" + key), true);
    await get(subscribersListRef).then((snapshot) => {
      const promises: Promise<void>[] = [];
      snapshot.forEach((subscriber) => {
        const subscriberRef = ref(
          db,
          "users/" + subscriber.key + "/news/" + key
        );
        promises.push(set(subscriberRef, true));
      });
      return Promise.all(promises);
    });
  }

  function transformForm() {
    if (isTelling) return;
    const input = textArea.current!;
    const container = form.current!;
    const label = textAreaLabel.current!;
    const textareaOffset = computeOffset(input, container);
    const headerOffset = computeOffset(label, container);
    container.style.cssText =
      "padding-bottom: 140px; border: 10px solid white;";
    input.style.cssText = `height: 5em; top: 85px; left: ${textareaOffset}px`;
    label.style.left = headerOffset + "px";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    setIsTelling(true);
  }

  function resetForm() {
    const input = textArea.current!;
    const value = input.value;
    if (value) return;
    const container = form.current!;
    const label = textAreaLabel.current!;
    input.style.cssText = "";
    container.style.cssText = "";
    label.style.cssText = "";
    setIsTelling(false);
  }

  function toggleFormControlls() {
    const input = textArea.current!;
    const value = input.value.trim();
    if (value) {
      setInputHasValue(true);
    } else {
      setInputHasValue(false);
    }
  }

  function clearInput() {
    const input = textArea.current!;
    input.value = "";
  }

  return (
    <Formik
      initialValues={{ text: "" }}
      onSubmit={async function (values) {
        try {
          //чтобы избежать скачков в анимации, используем then
          writePost(values.text).then(() => {
            clearInput();
            toggleFormControlls();
            resetForm();
          });
        } catch (e) {
          console.log(e);
        }
      }}
    >
      {({ handleChange }) => (
        <Form
          ref={form}
          noValidate
          className={
            (isTelling ? "wall__form_active " : "") +
            "wall__form tell-your-story brick-bordered "
          }
        >
          <span ref={textAreaLabel} className="tell-your-story__label">
            tell your story
          </span>
          <Field
            innerRef={textArea}
            className="form__input tell-your-story__input input_white-border"
            onBlur={resetForm}
            onFocus={transformForm}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              handleChange(e);
              toggleFormControlls();
            }}
            id="tell-your-story"
            name="text"
            component="textArea"
          />
          <svg
            className={`clear-icon tell-your-story__clear-icon ${
              inputHasValue ? "tell-your-story__clear-icon_visible" : ""
            }`}
            version="1.1"
            onClick={() => {
              clearInput();
              toggleFormControlls();
              resetForm();
            }}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid meet"
            viewBox="309.28153153153147 239.24099099099095 44.202702702702595 43.184684684684726"
          >
            <defs>
              <path
                d="M310.28 279.43L310.28 271.39L318.32
               271.39L318.32 279.43L310.28 279.43ZM342.44 
               279.43L342.44 271.39L350.48 271.39L350.48 279.43L342.44
                279.43ZM334.4 255.78L334.4 248.28L342.44 248.28L342.44 
                256.32L334.4 256.32L334.4 263.28L342.44 263.28L342.44 
                271.32L334.4 271.32L334.4 263.82L326.36 263.82L326.36
                 271.86L318.32 271.86L318.32 263.82L326.36 263.82L326.36 
                 256.32L318.32 256.32L318.32 248.28L326.36 248.28L326.36
                  255.78L334.4 255.78ZM310.28 248.28L310.28 240.24L318.32
                   240.24L318.32 248.28L310.28 248.28ZM342.44 248.28L342.44 
                   240.24L350.48 240.24L350.48 248.28L342.44 248.28Z"
                id="bSQoyF8gw"
              ></path>
            </defs>
            <g>
              <g>
                <use xlinkHref="#bSQoyF8gw" opacity="1" fillOpacity="1"></use>
              </g>
            </g>
          </svg>
          <button
            className={`button tell-your-story__submit-button post__submit-button controls__button
          ${inputHasValue ? "tell-your-story__submit-button_visible" : ""}
          `}
            type="submit"
          >
            send
          </button>
        </Form>
      )}
    </Formik>
  );
}
