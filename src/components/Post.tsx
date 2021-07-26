import React, { useState, useRef, useEffect } from "react";
import Avatar from "./Avatar";
import Comment from "./Comment";
import { CommentProps } from "./Comment";
import { Formik, Form, Field } from "formik";
import {
  getDatabase,
  ref,
  update,
  remove,
  set,
  onValue,
  off,
  push,
  serverTimestamp,
  get,
} from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import TextareaAutosize from "react-textarea-autosize";
export interface PostProps {
  userName: string;
  text: string;
  createdAt: string;
  postId: string;
  photoUrl: string;
  authorId: string;
}

export function formDate(date: string) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const newDate = new Date(date);
  return `${newDate.getDate()} ${
    monthNames[newDate.getMonth()]
  } ${newDate.getFullYear()} ${newDate.getHours()}:${
    newDate.getMinutes() < 10
      ? "0" + newDate.getMinutes()
      : newDate.getMinutes()
  }`;
}

export default function Post({
  userName,
  text,
  createdAt,
  postId,
  photoUrl,
  authorId,
}: PostProps) {
  //передаём много пропсов, но избегаем состояния загрузки в самом компоненте
  //загрузка усложняет и без того сложную логику рендера
  const { currentUser }: any = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likesAmount, setLikesAmount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [isCommenting, setIsCommenting] = useState(false);
  //удалить, не нужен
  const textRef = useRef<HTMLSpanElement>(null);

  function getLike() {
    const db = getDatabase();
    const likeRef = ref(db, "likes/posts/" + postId + "/" + currentUser.uid);
    onValue(likeRef, (snapshot) => {
      if (snapshot.val()) {
        setIsLiked(true);
      } else setIsLiked(false);
    });
  }

  function getLikesAmount() {
    const db = getDatabase();
    const likeRef = ref(db, "likes/posts/" + postId);
    onValue(likeRef, (snapshot) => {
      if (snapshot.val()) {
        setLikesAmount(snapshot.size);
      } else {
        setLikesAmount(0);
      }
    });
  }

  function getComments() {
    const db = getDatabase();
    const commentsRef = ref(db, "comments/" + postId);
    onValue(commentsRef, (snapshot) => {
      let comments: any = [];
      snapshot.forEach((childSnapshot) => {
        const comment = childSnapshot.val();
        comment.commentId = childSnapshot.key;
        comment.postId = postId;
        comments.push(comment);
      });
      setComments(comments);
    });
  }

  useEffect(() => {
    getComments();
    return () => {
      const db = getDatabase();
      off(ref(db, "comments/" + postId));
    };
  }, []);

  useEffect(() => {
    getLike();
    return () => {
      const db = getDatabase();
      off(ref(db, "likes/posts/" + postId + "/" + currentUser.uid));
    };
  }, []);

  useEffect(() => {
    getLikesAmount();
    return () => {
      const db = getDatabase();
      off(ref(db, "likes/posts/" + postId));
    };
  }, []);

  function deletePost(postId: string) {
    const db = getDatabase();
    const postRef = ref(db, "posts/" + postId);
    const userPostRef = ref(
      db,
      "users/" + currentUser.uid + "/posts/" + postId
    );
    const postLikesRef = ref(db, "likes/posts/" + postId);
    const postCommentsRef = ref(db, "comments/" + postId);
    const subscribersRef = ref(db, "users/" + currentUser.uid + "subscribers/");
    //если оставить кнопки, другой юзер сможет удалить комменты и лайки от поста
    remove(postRef)
      .then(() => remove(userPostRef))
      .then(() => {
        return get(subscribersRef).then((snapshot) => {
          const promises: Promise<void>[] = [];
          snapshot.forEach((subscriber) => {
            const newRef = ref(
              db,
              "users/" + subscriber.key + "/news/" + postId
            );
            promises.push(remove(newRef));
          });
          return Promise.all(promises);
        });
      })
      .then(() => remove(postCommentsRef))
      .then(() => remove(postLikesRef))
      .catch((e) => console.log(e));
  }

  function like(postId: string) {
    const db = getDatabase();
    const likeRef = ref(db, "likes/posts/" + postId + "/" + currentUser.uid);
    set(likeRef, true);
  }

  function unlike(postId: string) {
    const db = getDatabase();
    const likeRef = ref(db, "likes/posts/" + postId + "/" + currentUser.uid);
    remove(likeRef);
  }

  const editForm = (
    <Formik
      initialValues={{ text: text }}
      onSubmit={async function (values) {
        try {
          let trimedText = values.text.trim();
          if (trimedText) {
            const db = getDatabase();
            const postRef = ref(db, "posts/" + currentUser.uid + "/" + postId);
            update(postRef, { text: trimedText }).then(() =>
              setIsEditing(false)
            );
          }
        } catch (e) {
          console.log(e);
        }
      }}
    >
      {() => (
        <Form noValidate>
          <Field
            as={TextareaAutosize}
            className="form__input input_white-border edit-input"
            name="text"
          />
          <div className="post__footer">
            <button
              className="button post__submit-button controls__button"
              type="submit"
            >
              edit
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );

  const commentForm = (
    <Formik
      initialValues={{ text: "" }}
      onSubmit={async function (values) {
        try {
          let trimedText = values.text.trim();
          if (trimedText) {
            const db = getDatabase();
            const postRef = ref(db, "comments/" + postId);
            const commentRef = push(postRef);
            set(commentRef, {
              author: currentUser.uid,
              text: trimedText,
              createdAt: serverTimestamp(),
            });
            setIsCommenting(false);
          }
        } catch (e) {
          console.log(e);
        }
      }}
    >
      {({ resetForm }) => (
        <Form noValidate className="comment-form post__comment-form">
          <Field
            as={TextareaAutosize}
            className="form__input input_white-border comment-input"
            name="text"
          />
          <button
            className="button post__submit-button comment__submit-button controls__button"
            type="submit"
          >
            send
          </button>
          <button
            className="button post__submit-button comment__submit-button controls__button"
            type="reset"
            onClick={() => {
              resetForm();
              setIsCommenting(false);
            }}
          >
            cancel
          </button>
        </Form>
      )}
    </Formik>
  );

  function toggleEditing() {
    setIsEditing((isEditing) => !isEditing);
  }

  function toggleDeleting() {
    setIsDeleting((isDeleting) => !isDeleting);
  }
  return (
    <div className={`post brick-bordered post_commenting`}>
      {isDeleting ? (
        <div className="post-deletion">
          <div className="post-deletion__header">delete this post</div>
          <div className="controls post-deletion__controls">
            <span
              className="controls__button"
              onClick={() => deletePost(postId)}
            >
              yes
            </span>
            <span className="controls__button" onClick={toggleDeleting}>
              no
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="post__header">
            <div className="post__info">
              <Avatar src={photoUrl} parent="post"></Avatar>
              <p className="post__author-name">{userName}</p>
              <p className="post__created-at">{formDate(createdAt)}</p>
            </div>
            <div className="post__controls controls">
              <span className="controls__button" onClick={toggleEditing}>
                {isEditing ? "cancel editing" : "edit"}
              </span>
              {isEditing ? null : (
                <span className="controls__button" onClick={toggleDeleting}>
                  delete
                </span>
              )}
            </div>
          </div>
          {isEditing ? (
            editForm
          ) : (
            <>
              <span ref={textRef} className="post__text">
                {text.replace("_b", "\n")}
              </span>
              <div className="post__footer">
                <div className="post__icon-container">
                  <svg
                    onClick={() => setIsCommenting(true)}
                    className="post__icon icon comment-icon"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="444.91472506989754 450.3358185771981 68.3243243243241 68.32432432432415"
                    width="64.32"
                    height="64.32"
                  >
                    <defs>
                      <path
                        d="M462 515.66L462 507.62L470.04 507.62L470.04 515.66L462 515.66ZM470.04 507.62L470.04 499.58L478.08 499.58L478.08 507.62L470.04 507.62ZM478.08 499.58L478.08 491.54L486.12 491.54L486.12 499.58L478.08 499.58ZM462 499.58L462 491.54L470.04 491.54L470.04 499.58L462 499.58ZM494.16 491.54L494.16 483.5L502.2 483.5L502.2 491.54L494.16 491.54ZM453.96 491.54L453.96 483.5L462 483.5L462 491.54L453.96 491.54ZM486.12 491.54L486.12 483.5L494.16 483.5L494.16 491.54L486.12 491.54ZM502.2 483.5L502.2 475.46L510.24 475.46L510.24 483.5L502.2 483.5ZM445.91 483.5L445.91 475.46L453.96 475.46L453.96 483.5L445.91 483.5ZM502.2 475.46L502.2 459.38L510.24 459.38L510.24 475.46L502.2 475.46ZM445.91 475.46L445.91 459.38L453.96 459.38L453.96 475.46L445.91 475.46ZM494.16 459.38L494.16 451.34L502.2 451.34L502.2 459.38L494.16 459.38ZM453.96 459.38L453.96 451.34L494.16 451.34L494.16 459.38L453.96 459.38Z"
                        id="anojSJ9It"
                      ></path>
                      <path
                        d="M470.04 499.58L470.04 491.54L478.08 491.54L478.08 499.58L470.04 499.58ZM478.08 491.54L478.08 483.5L486.12 483.5L486.12 491.54L478.08 491.54ZM462 491.54L462 483.5L478.08 483.5L478.08 491.54L462 491.54ZM486.12 483.5L486.12 467.42L502.2 467.42L502.2 483.5L486.12 483.5ZM470.04 483.5L470.04 467.42L486.12 467.42L486.12 483.5L470.04 483.5ZM453.96 483.5L453.96 467.42L470.04 467.42L470.04 483.5L453.96 483.5ZM453.96 467.42L453.96 459.38L470.04 459.38L470.04 467.42L453.96 467.42ZM470.04 467.42L470.04 459.38L486.12 459.38L486.12 467.42L470.04 467.42ZM486.12 467.42L486.12 459.38L502.2 459.38L502.2 467.42L486.12 467.42Z"
                        id="a1lbliPFde"
                      ></path>
                    </defs>
                    <g className="icon__outer-group">
                      <use
                        xlinkHref="#anojSJ9It"
                        opacity="1"
                        fillOpacity="1"
                      ></use>
                    </g>
                    <g className="icon__inner-group">
                      <use
                        xlinkHref="#a1lbliPFde"
                        opacity="1"
                        fillOpacity="1"
                      ></use>
                    </g>
                  </svg>
                </div>
                <div className="post__icon-container">
                  <svg
                    onClick={() => (isLiked ? unlike(postId) : like(postId))}
                    className={`post__icon icon like-icon ${
                      isLiked ? "like-icon_liked" : ""
                    }`}
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="336.88198198198114 343.87169274537797 76.36486486486467 68.32432432432415"
                    width="72.36"
                    height="64.32"
                  >
                    <defs>
                      <path
                        d="M370.04 401.16L370.04 393.11L378.08 393.11L378.08 401.16L370.04 401.16ZM378.08 368.99L378.08 360.95L402.21 360.95L402.21 377.03L394.17 377.03L394.17 385.07L386.13 385.07L386.13 393.11L362 393.11L362 385.07L353.96 385.07L353.96 377.03L345.92 377.03L345.92 360.95L370.04 360.95L370.04 368.99L378.08 368.99ZM402.21 352.91L402.21 360.95L386.13 360.95L386.13 352.91L402.21 352.91ZM345.92 360.95L345.92 352.91L362 352.91L362 360.95L345.92 360.95Z"
                        id="b1iQfvxk1P"
                      ></path>
                      <path
                        d="M370.04 409.2L370.04 401.16L378.08 401.16L378.08 409.2L370.04 409.2ZM386.13 393.11L386.13 401.16L378.08 401.16L378.08 393.11L386.13 393.11L386.13 385.07L394.17 385.07L394.17 393.11L386.13 393.11ZM362 401.16L362 393.11L370.04 393.11L370.04 401.16L362 401.16ZM353.96 393.11L353.96 385.07L362 385.07L362 393.11L353.96 393.11ZM394.17 385.07L394.17 377.03L402.21 377.03L402.21 385.07L394.17 385.07ZM345.92 385.07L345.92 377.03L353.96 377.03L353.96 385.07L345.92 385.07ZM337.88 377.03L337.88 352.91L345.92 352.91L345.92 377.03L337.88 377.03ZM402.21 377.03L402.21 352.91L410.25 352.91L410.25 377.03L402.21 377.03ZM370.04 368.99L370.04 360.95L378.08 360.95L378.08 368.99L370.04 368.99ZM362 360.95L362 352.91L370.04 352.91L370.04 360.95L362 360.95ZM402.21 352.91L386.13 352.91L386.13 360.95L378.08 360.95L378.08 352.91L386.13 352.91L386.13 344.87L402.21 344.87L402.21 352.91ZM345.92 352.91L345.92 344.87L362 344.87L362 352.91L345.92 352.91Z"
                        id="d3vzMpYCa"
                      ></path>
                    </defs>
                    <g className="icon__inner-group">
                      <use
                        xlinkHref="#b1iQfvxk1P"
                        opacity="1"
                        fillOpacity="1"
                      ></use>
                    </g>
                    <g className="icon__outer-group">
                      <use
                        xlinkHref="#d3vzMpYCa"
                        opacity="1"
                        fillOpacity="1"
                      ></use>
                    </g>
                  </svg>{" "}
                  {likesAmount > 0 ? likesAmount : null}
                </div>
              </div>
            </>
          )}
          <div className="comments">
            {comments.map((item, index) => (
              <Comment
                commentId={item.commentId}
                postId={item.postId}
                author={item.author}
                text={item.text}
                createdAt={item.createdAt}
                key={item.createdAt + index}
              ></Comment>
            ))}
          </div>
        </>
      )}

      {isCommenting ? commentForm : null}
    </div>
  );
}
