import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Formik, Form, Field } from "formik";
import Avatar from "./Avatar";
import Message from "./Message";
import { computeOffset } from "./TellYourStory";
import {
  getDatabase,
  ref,
  get,
  push,
  remove,
  update,
  set,
  serverTimestamp,
  onValue,
  off,
} from "@firebase/database";
import Loader from "./Loader";
import { UserData } from "./UserProfile";
import { getUserData } from "./UserProfile";

export interface ChosenMessageProps {
  messageId: string;
  text: string;
}

export interface MessageProps {
  text: string;
  createdAt: string;
  author: string;
  isLastInRow?: boolean;
  isFirst?: boolean;
  interlocutor?: string;
  messageId?: string;
}

export function getPathByUsers(currentUserId: string, otherUserId: string) {
  return currentUserId > otherUserId
    ? currentUserId + otherUserId
    : otherUserId + currentUserId;
}

export default function Chat() {
  function centerAvatar(element: HTMLElement) {}
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chosenMessage, setChosenMessage] = useState<ChosenMessageProps | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const { userId } = useParams<any>();
  const { currentUser } = useAuth();

  let path = getPathByUsers(currentUser!.uid, userId);
  const controlsRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const inputRef = useRef() as React.MutableRefObject<HTMLFormElement>;

  function writeMessage(message: MessageProps) {
    const db = getDatabase();
    const messageListRef = ref(db, "messages/" + path);
    const newMessageRef = push(messageListRef);
    return set(newMessageRef, message);
  }

  function updateMessage(text: string, messageId: string) {
    const db = getDatabase();
    const messageRef = ref(db, "messages/" + path + "/" + messageId);
    return update(messageRef, { text: text });
  }

  async function setChatsForUsers(message: MessageProps) {
    const db = getDatabase();
    const currentUserChatRef = ref(
      db,
      "chats/" + currentUser!.uid + "/" + path
    );
    const m1 = { ...message, interlocutor: currentUser!.uid };
    const m2 = { ...message, interlocutor: userId };
    const interlocutorChatRef = ref(db, "chats/" + userId! + "/" + path);
    await set(currentUserChatRef, m2);
    await set(interlocutorChatRef, m1);
  }

  function deleteMessage(messageId: string) {
    const db = getDatabase();
    const messageRef = ref(db, "messages/" + path + "/" + messageId);
    return remove(messageRef).then(() => setChosenMessage(null));
  }

  function resetControls() {
    setIsDeleting(false);
    setIsEditing(false);
  }

  function getMessages() {
    const db = getDatabase();
    const postsRef = ref(db, "messages/" + path);
    onValue(postsRef, (snapshot) => {
      console.time("doSomething");
      let messages: MessageProps[] = [];
      let previeousAuthor = "";
      let messagesCounter = 0;
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data.messageId = childSnapshot.key;
        if (data.author !== previeousAuthor) {
          if (userId == data.author) {
            data.isFirst = true;
          }
          if (currentUser!.uid == data.author) {
            data.isLastInRow = true;
          }
          previeousAuthor = data.author;
        } else {
          if (data.author === currentUser!.uid) {
            messages[messagesCounter - 1].isLastInRow = false;

            data.isLastInRow = true;
          }
        }
        messagesCounter++;
        messages.push(data);
      });
      //firebase не поддерживает сортировку по убыванию
      setMessages(messages);

      console.timeEnd("doSomething");
    });
  }

  useEffect(() => {
    getUserData(userId).then((snapshot) => setUserData(snapshot.val()));
    getUserData(currentUser!.uid).then((snapshot) =>
      setCurrentUserData(snapshot.val())
    );
  }, []);

  useEffect(() => {
    getMessages();
    return () => {
      const db = getDatabase();
      off(ref(db, "chat/" + path));
    };
  }, []);

  useEffect(() => {
    if (userData && currentUserData) {
      setIsLoading(false);
    }
  }, [userData, currentUserData]);

  function toggleEditing() {
    setIsEditing((isEditing) => !isEditing);
  }

  function toggleDeleting() {
    setIsDeleting((isDeleting) => !isDeleting);
  }

  const editForm = chosenMessage ? (
    <Formik
      initialValues={{ text: chosenMessage.text }}
      enableReinitialize={true}
      onSubmit={async function (values) {
        try {
          await updateMessage(values.text, chosenMessage!.messageId);
          toggleEditing();
          setChosenMessage(null);
        } catch (e) {
          console.log(e);
        }
      }}
    >
      {({ handleChange }) => (
        <Form ref={inputRef}>
          <Field name="text" />

          <button type="submit">update</button>
        </Form>
      )}
    </Formik>
  ) : null;

  const sendForm = (
    <Formik
      initialValues={{ text: "" }}
      onSubmit={async function (values) {
        try {
          const message = {
            text: values.text,
            createdAt: serverTimestamp().toString(),
            author: currentUser!.uid,
          };
          await writeMessage(message);
          await setChatsForUsers(message);
        } catch (e) {
          console.log(e);
        }
      }}
    >
      {({ handleChange }) => (
        <Form>
          <Field name="text" />

          <button type="submit">send</button>
        </Form>
      )}
    </Formik>
  );

  return (
    <div className="page page_centralized container">
      {isLoading ? (
        <Loader></Loader>
      ) : (
        <div className="chat bordered-container glassed-container">
          <div className="chat__header">
            <Avatar
              className="chat__interlocutor-avatar"
              src={userData!.photoUrl}
              parent="chat"
            ></Avatar>
            <div className="interlocutor__name">Федя</div>
            {chosenMessage ? (
              <div className="chat__controls controls" ref={controlsRef}>
                {isDeleting ? (
                  <div className="post-deletion">
                    <div className="post-deletion__header">
                      delete selected message
                    </div>
                    <div className="controls post-deletion__controls">
                      <span
                        className="controls__button"
                        onClick={() => deleteMessage(chosenMessage!.messageId)}
                      >
                        yes
                      </span>
                      <span
                        className="controls__button"
                        onClick={toggleDeleting}
                      >
                        no
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {" "}
                    <span className="controls__button" onClick={toggleEditing}>
                      {isEditing ? "cancel editing" : "edit"}
                    </span>
                    {isEditing ? null : (
                      <span
                        className="controls__button"
                        onClick={toggleDeleting}
                      >
                        delete
                      </span>
                    )}{" "}
                  </>
                )}
              </div>
            ) : null}
          </div>
          <div className="messages">
            {messages.length
              ? messages.map((item) => (
                  <Message
                    setChosenMessage={setChosenMessage}
                    text={item.text}
                    isMine={item.author === currentUser!.uid}
                    isFirst={item.isFirst}
                    isLastInRow={item.isLastInRow}
                    messageId={item.messageId!}
                    controlsRef={controlsRef}
                    inputRef={inputRef}
                    resetControls={resetControls}
                  ></Message>
                ))
              : "there is nothing yet"}
          </div>
          <div className="chat__footer">
            {isEditing ? editForm : sendForm}

            <Avatar src={currentUserData!.photoUrl} parent="chat"></Avatar>
          </div>
        </div>
      )}
    </div>
  );
}
