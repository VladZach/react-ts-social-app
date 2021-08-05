import React, { useState, useEffect } from "react";
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
  increment,
} from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import TextareaAutosize from "react-textarea-autosize";
import { PROFILE_TEXT_PLACEHOLDER } from "../consts";
export interface PostProps {
  userName: string;
  createdAt: string;
  postId: string;
  photoUrl: string;
  authorId: string;
}

export function formateDate(dateString: string) {
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
  const date = new Date(dateString);
  return `${date.getDate()} ${
    monthNames[date.getMonth()]
  } ${date.getFullYear()} ${date.getHours()}:${
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
  }`;
}

const Post = React.memo(function Post({
  userName,
  createdAt,
  postId,
  photoUrl,
  authorId,
}: PostProps) {
  //передаём много пропсов, но избегаем состояния загрузки в самом компоненте
  //загрузка усложняет и без того сложную логику рендера
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [commentsAmount, setCommentsAmount] = useState(0);
  const [likesAmount, setLikesAmount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  //из-за структуры базы данных, приходится следить за обновлениями поста отдельно
  const [postText, setPostText] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [allCommentsShown, setAllCommentsShown] = useState(false);

  const db = getDatabase();
  const isMine = currentUser!.uid == authorId;

  function watchLike() {
    const likeRef = ref(db, "likes/posts/" + postId + "/" + currentUser!.uid);
    onValue(likeRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsLiked(true);
      } else setIsLiked(false);
    });
  }

  function watchPostText() {
    const postTextRef = ref(db, "posts/" + postId + "/text");
    onValue(postTextRef, (snapshot) => {
      setPostText(snapshot.val());
    });
  }

  function watchLikesAmount() {
    const likeRef = ref(db, "likes/posts/" + postId);
    onValue(likeRef, (snapshot) => {
      if (snapshot.exists()) {
        setLikesAmount(snapshot.size);
      } else {
        setLikesAmount(0);
      }
    });
  }

  function watchComments() {
    const commentsRef = ref(db, "comments/" + postId);
    onValue(commentsRef, (snapshot) => {
      const comments: CommentProps[] = [];
      snapshot.forEach((childSnapshot) => {
        const comment = childSnapshot.val();
        comment.commentId = childSnapshot.key;
        comment.postId = postId;
        comments.push(comment);
      });
      setComments(comments);
      setCommentsAmount(snapshot.size);
    });
  }

  useEffect(() => {
    watchComments();
    return () => {
      off(ref(db, "comments/" + postId));
    };
  }, []);

  useEffect(() => {
    watchLike();
    return () => {
      off(ref(db, "likes/posts/" + postId + "/" + currentUser!.uid));
    };
  }, []);

  useEffect(() => {
    watchLikesAmount();
    return () => {
      off(ref(db, "likes/posts/" + postId));
    };
  }, []);

  useEffect(() => {
    watchPostText();
    return () => {
      off(ref(db, "posts/" + postId + "/text"));
    };
  });

  function editPost(text: string) {
    let trimedText = text.trim();
    if (trimedText) {
      const postRef = ref(db, "posts/" + postId);
      return update(postRef, { text: trimedText });
    }
  }

  async function deletePost(postId: string) {
    const postRef = ref(db, "posts/" + postId);
    const userPostRef = ref(
      db,
      "users/" + currentUser!.uid + "/posts/" + postId
    );
    const postLikesRef = ref(db, "likes/posts/" + postId);
    const postCommentsRef = ref(db, "comments/" + postId);
    const subscribersRef = ref(
      db,
      "users/" + currentUser!.uid + "/subscribers/"
    );
    const postsCounterRef = ref(db, "counters/posts/" + currentUser!.uid);
    //если оставить кнопки, другой юзер сможет удалить комменты и лайки от поста
    //удаляем пост
    await remove(postRef);
    //декрементируем счётчик постов
    await set(postsCounterRef, increment(-1));
    //удаляем флаг поста у юзера
    await remove(userPostRef);
    //получаем всех подписчиков
    const subscribers = await get(subscribersRef);
    const promises: Promise<void>[] = [];
    //для каждого из подписчиков удаляем флаг поста в новостях
    // и декрементируем счётчик новостей
    subscribers.forEach((subscriber) => {
      const newRef = ref(db, "users/" + subscriber.key + "/news/" + postId);

      const newsCounterRef = ref(db, "counters/news/" + subscriber.key);
      promises.push(remove(newRef));
      promises.push(set(newsCounterRef, increment(-1)));
    });
    await Promise.all(promises);
    //удаляем комменты поста
    await remove(postCommentsRef);
    //удаляем лайки поста
    await remove(postLikesRef);
  }

  function writeComment(text: string) {
    let trimedText = text.trim();
    if (trimedText) {
      const postRef = ref(db, "comments/" + postId);
      const commentRef = push(postRef);
      return set(commentRef, {
        authorId: currentUser!.uid,
        text: trimedText,
        createdAt: serverTimestamp(),
      });
    }
  }

  function toggleEditing() {
    setIsEditing((isEditing) => !isEditing);
  }

  function toggleDeleting() {
    setIsDeleting((isDeleting) => !isDeleting);
  }

  function like(postId: string) {
    const likeRef = ref(db, "likes/posts/" + postId + "/" + currentUser!.uid);
    set(likeRef, true);
  }

  function unlike(postId: string) {
    const likeRef = ref(db, "likes/posts/" + postId + "/" + currentUser!.uid);
    remove(likeRef);
  }

  const editForm = (
    <Formik
      initialValues={{ text: postText }}
      onSubmit={async function ({ text }) {
        try {
          await editPost(text);
          setIsEditing(false);
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
      onSubmit={async function ({ text }) {
        try {
          await writeComment(text);
          setIsCommenting(false);
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
              <p className="post__author-name">
                {userName ? userName : PROFILE_TEXT_PLACEHOLDER}
              </p>
              <p className="post__created-at">{formateDate(createdAt)}</p>
            </div>
            {isMine ? (
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
            ) : null}
          </div>
          {isEditing ? (
            editForm
          ) : (
            <>
              <span className="post__text">{postText}</span>
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
                  {commentsAmount > 0 ? commentsAmount : null}
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
                  </svg>
                  {likesAmount > 0 ? likesAmount : null}
                </div>
              </div>
            </>
          )}
          <div className="comments">
            {comments.map((item, index) => {
              if (index >= 2 && !allCommentsShown) {
                return null;
              }
              return (
                <Comment
                  commentId={item.commentId}
                  postId={item.postId}
                  authorId={item.authorId}
                  text={item.text}
                  createdAt={item.createdAt}
                  key={item.createdAt + index}
                ></Comment>
              );
            })}
            {commentsAmount > 2 ? (
              <div className="comment__footer">
                <div
                  className="comments__all-comments-button"
                  onClick={() => {
                    setAllCommentsShown((prevState) => !prevState);
                  }}
                >
                  {allCommentsShown ? "Hide comments" : "Show all comments"}
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}

      {isCommenting ? commentForm : null}
    </div>
  );
});

export default Post;
