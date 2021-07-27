import React, { useState } from "react";
import {
  getDatabase,
  ref,
  remove,
  set,
  update,
  onValue,
  off,
} from "firebase/database";
import { useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { useAuth } from "../contexts/AuthContext";
import { formateDate } from "./Post";
import { UserData, getUserData } from "./UserProfile";
import TextareaAutosize from "react-textarea-autosize";
import Avatar from "./Avatar";

export interface CommentProps {
  text: string;
  createdAt: string;
  authorId: string;
  commentId: string;
  postId: string;
}

export default function Comment({
  text,
  createdAt,
  authorId,
  commentId,
  postId,
}: CommentProps) {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likesAmount, setLikesAmount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const isMine = currentUser!.uid === authorId;
  const db = getDatabase();

  function editComment(text: string) {
    let trimedText = text.trim();
    if (trimedText) {
      const postRef = ref(db, "comments/" + postId + "/" + commentId);
      return update(postRef, { text: trimedText });
    }
  }

  function deleteComment() {
    const commentRef = ref(db, "comments/" + postId + "/" + commentId);
    const commentLikesRef = ref(db, "likes/comments/" + commentId);
    //если оставить кнопки, другой юзер сможет удалить комменты и лайки от поста
    remove(commentRef)
      .then(() => remove(commentRef))
      .then(() => remove(commentLikesRef))
      .catch((e) => console.log(e));
  }

  function watchLike() {
    const likeRef = ref(
      db,
      "likes/comments/" + commentId + "/" + currentUser!.uid
    );
    onValue(likeRef, (snapshot) => {
      if (snapshot.val()) {
        setIsLiked(true);
      } else setIsLiked(false);
    });
  }

  function watchLikesAmount() {
    const likeRef = ref(db, "likes/comments/" + commentId);
    onValue(likeRef, (snapshot) => {
      if (snapshot.val()) {
        setLikesAmount(snapshot.size);
      } else {
        setLikesAmount(0);
      }
    });
  }

  function like(commentId: string) {
    const likeRef = ref(
      db,
      "likes/comments/" + commentId + "/" + currentUser!.uid
    );

    set(likeRef, true);
  }

  function unlike(commentId: string) {
    const likeRef = ref(
      db,
      "likes/comments/" + commentId + "/" + currentUser!.uid
    );
    remove(likeRef);
  }

  function toggleEditing() {
    setIsEditing((isEditing) => !isEditing);
  }

  function toggleDeleting() {
    setIsDeleting((isDeleting) => !isDeleting);
  }

  useEffect(() => {
    watchLike();
    return () => {
      off(ref(db, "likes/comments/" + commentId + "/" + currentUser!.uid));
    };
  }, []);

  useEffect(() => {
    watchLikesAmount();
    return () => {
      off(ref(db, "likes/comments/" + commentId));
    };
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    getUserData(authorId).then((snapshot) => setUserData(snapshot.val()));
    return () => {
      isSubscribed = false;
    };
  }, []);

  useEffect(() => {
    if (userData) {
      setIsLoading(false);
    }
  }, [userData]);

  const editForm = (
    <Formik
      initialValues={{ text: text }}
      onSubmit={async function ({ text }) {
        try {
          await editComment(text);
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

  return isLoading ? null : (
    <div className="comment post__comment">
      {isDeleting ? (
        <div className="post-deletion">
          <div className="post-deletion__header">delete this post</div>
          <div className="controls post-deletion__controls">
            <span className="controls__button" onClick={deleteComment}>
              yes
            </span>
            <span className="controls__button" onClick={toggleDeleting}>
              no
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="comment__header">
            <div className="comment__info">
              <Avatar src={userData!.photoUrl} parent="comment"></Avatar>
              <p className="comment__author-name">{userData!.fullName}</p>
              <p className="comment__created-at">{formateDate(createdAt)}</p>
            </div>
            {isMine ? (
              <div className="comment__controls controls">
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
              <span className="comment__text">{text}</span>
              <div className="comment__icon-container">
                <svg
                  onClick={() =>
                    isLiked ? unlike(commentId) : like(commentId)
                  }
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
            </>
          )}
        </>
      )}
    </div>
  );
}
