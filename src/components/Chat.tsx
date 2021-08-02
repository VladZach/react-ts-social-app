import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Formik, Form, Field } from "formik";
import {
  getDatabase,
  ref,
  push,
  remove,
  update,
  set,
  serverTimestamp,
  onValue,
  off,
  get,
  increment,
} from "@firebase/database";
import Avatar from "./Avatar";
import Message from "./Message";
import Loader from "./Loader";
import { UserData } from "./UserProfile";
import { getUserData } from "./UserProfile";
import { DataSnapshot, limitToLast, query } from "firebase/database";
import InfiniteScroll from "react-infinite-scroll-component";

export interface SelectedMessageProps {
  id: string;
  text: string;
}

export interface MessageObject {
  id?: string;
  text: string;
  createdAt: string | object;
  authorId: string;
  hasScionOnBottom?: boolean;
  hasScionOnTop?: boolean;
  interlocutorId?: string;
}

export function getRefPathByUsersNames(userId: string, otherUserId: string) {
  return userId > otherUserId ? userId + otherUserId : otherUserId + userId;
}

export default function Chat() {
  const [interlocutorData, setInterlocutorData] = useState<UserData | null>(
    null
  );
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [selectedMessage, setSelectedMessage] =
    useState<SelectedMessageProps | null>(null);
  const [messages, setMessages] = useState<MessageObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesPerScroll = 20;
  const [messagesToShow, setMessagesToShow] = useState(messagesPerScroll);
  const [totalMessagesAmount, setTotalMessagesAmount] = useState(0);
  const [chat, setChat] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { interlocutorId } = useParams<any>();
  const { currentUser } = useAuth();

  const db = getDatabase();
  const path = getRefPathByUsersNames(currentUser!.uid, interlocutorId);

  // const messagesWindowRef = useCallback(
  //   (window) => {
  //     if (window) {
  //       window.scrollTop = window.scrollHeight;
  //     }
  //   },
  //   [messages]
  // );
  const controlsRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const formRef = useRef() as React.MutableRefObject<HTMLFormElement>;

  async function writeMessage(message: MessageObject) {
    const messageListRef = ref(db, "messages/" + path);
    const messagesCounterRef = ref(db, "counters/messages/" + path);
    const newMessageRef = push(messageListRef);
    await set(messagesCounterRef, increment(1));
    return set(newMessageRef, message);
  }

  function updateMessage(text: string, messageId: string) {
    const messageRef = ref(db, "messages/" + path + "/" + messageId);
    return update(messageRef, { text: text });
  }

  async function watchChats() {
    const chatRef = ref(db, "chats/" + currentUser!.uid + "/" + path);
    onValue(chatRef, (chat) => {
      setChat(chat.val());
    });
  }
  async function setChatsForUsers(message: MessageObject) {
    const currentUserChatRef = ref(
      db,
      "chats/" + currentUser!.uid + "/" + path
    );
    const interlocutorChatRef = ref(
      db,
      "chats/" + interlocutorId! + "/" + path
    );
    const message1 = {
      ...message,
      interlocutorId: currentUser!.uid,
      wasRed: false,
    };
    const message2 = {
      ...message,
      interlocutorId: interlocutorId,
      wasRed: false,
    };
    await set(currentUserChatRef, message2);
    await set(interlocutorChatRef, message1);
  }

  async function deleteMessage(messageId: string) {
    const messageRef = ref(db, "messages/" + path + "/" + messageId);
    const counterRef = ref(db, "counters/messages/" + path);

    await remove(messageRef);
    set(counterRef, increment(-1));
    setSelectedMessage(null);
  }

  function resetControls() {
    setIsDeleting(false);
    setIsEditing(false);
  }

  async function readMessage() {
    const currentUserChatRef = ref(
      db,
      "chats/" + currentUser!.uid + "/" + path
    );
    await update(currentUserChatRef, { wasRed: true });
  }

  function addScionsToMessages(messagesSnapshot: DataSnapshot) {
    const messages: MessageObject[] = [];
    let previousAuthor = "";
    let messagesCounter = 0;
    messagesSnapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      message.id = childSnapshot.key;
      //если предыдущее сообщение от другого автора
      if (message.authorId !== previousAuthor) {
        //и текущее сообщение - от собеседника
        if (interlocutorId == message.authorId) {
          //делаем сообщению "отросток" вверх
          message.hasScionOnTop = true;
        }
        //если же прошлое сообщение от другого автора
        //и текущее сообщение от текущего пользователя
        if (currentUser!.uid == message.authorId) {
          //делаем "отросток" вниз
          message.hasScionOnBottom = true;
        }
        previousAuthor = message.authorId;
      } else {
        //если предыдущее сообщение от того же автора
        //и этот автор - текущий юзер
        if (message.authorId === currentUser!.uid) {
          //убираем "отросток" у предыдущего сообщения, и делаем у этого
          messages[messagesCounter - 1].hasScionOnBottom = false;
          message.hasScionOnBottom = true;
        }
      }
      messagesCounter++;
      messages.push(message);
    });
    return messages;
  }

  async function getMessages() {
    const messagesRef = ref(db, "messages/" + path);
    const limitedMessagesRef = query(
      messagesRef,
      limitToLast(messagesToShow + messagesPerScroll)
    );

    onValue(
      limitedMessagesRef,
      (snapshot) => {
        const messages = addScionsToMessages(snapshot);

        setMessagesToShow((prev) => prev + messagesPerScroll);

        setMessages(messages.reverse());
      },
      { onlyOnce: true }
    );
  }

  async function watchMessages() {
    const messagesRef = ref(db, "messages/" + path);
    const limitedMessagesRef = query(messagesRef, limitToLast(messagesToShow));
    onValue(limitedMessagesRef, (snapshot) => {
      const messages = addScionsToMessages(snapshot);
      setMessages(messages.reverse());
    });
  }

  async function getTotalMessagesAmount() {
    const counterRef = ref(db, "counters/messages/" + path);
    onValue(counterRef, (snapshot) => {
      setTotalMessagesAmount(snapshot.val());
    });
  }
  function toggleEditing() {
    setIsEditing((isEditing) => !isEditing);
  }

  function toggleDeleting() {
    setIsDeleting((isDeleting) => !isDeleting);
  }
  useEffect(() => {
    getTotalMessagesAmount();
    console.log(totalMessagesAmount);
  }, []);
  useEffect(() => {
    readMessage();
  }, [chat]);

  useEffect(() => {
    getUserData(interlocutorId).then((snapshot) =>
      setInterlocutorData(snapshot.val())
    );
    getUserData(currentUser!.uid).then((snapshot) =>
      setCurrentUserData(snapshot.val())
    );
    watchMessages();
    watchChats();
    return () => {
      off(ref(db, "chat/" + path));
    };
  }, []);

  useEffect(() => {
    if (interlocutorData && currentUserData) {
      setIsLoading(false);
    }
  }, [interlocutorData, currentUserData]);

  const editForm = (
    <Formik
      initialValues={{ text: selectedMessage?.text }}
      //реинициализация для изменения initialValues после выбора сообщения
      enableReinitialize={true}
      onSubmit={async function (values) {
        try {
          await updateMessage(values.text!, selectedMessage!.id);
          toggleEditing();
          setSelectedMessage(null);
        } catch (e) {
          console.log(e);
        }
      }}
    >
      {() => (
        <Form ref={formRef}>
          <Field name="text" />
          <button type="submit">update</button>
        </Form>
      )}
    </Formik>
  );

  const sendForm = (
    <Formik
      initialValues={{ text: "" }}
      onSubmit={async function (values) {
        try {
          const message = {
            text: values.text,
            createdAt: serverTimestamp(),
            authorId: currentUser!.uid,
          };
          await writeMessage(message);
          await setChatsForUsers(message);
        } catch (e) {
          console.log(e);
        }
      }}
    >
      {() => (
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
              src={interlocutorData!.photoUrl}
              parent="chat"
            ></Avatar>
            <div className="interlocutor__name">
              {interlocutorData!.fullName}
            </div>
            {selectedMessage ? (
              <div className="chat__controls" ref={controlsRef}>
                {isDeleting ? (
                  <div className="post-deletion">
                    <div className="post-deletion__header">
                      delete selected message
                    </div>
                    <div className="controls post-deletion__controls">
                      <span
                        className="controls__button"
                        onClick={() => deleteMessage(selectedMessage!.id)}
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
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>
          <div
            id="scrollableDiv"
            className="messages"
            style={{
              height: 300,
              overflow: "auto",
              display: "flex",
              flexDirection: "column-reverse",
            }}
          >
            {messages.length ? (
              <InfiniteScroll
                style={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  width: "100%",
                  overflow: "inherit",
                }}
                next={getMessages}
                inverse={true}
                hasMore={totalMessagesAmount > messages.length}
                loader={<Loader></Loader>}
                dataLength={messages.length}
                scrollableTarget="scrollableDiv"
              >
                {messages.map((item) => (
                  <Message
                    id={item.id!}
                    text={item.text}
                    key={item.createdAt as string}
                    isMine={item.authorId === currentUser!.uid}
                    hasScionOnTop={item.hasScionOnTop}
                    hasScionOnBottom={item.hasScionOnBottom}
                    setSelectedMessage={setSelectedMessage}
                    controlsRef={controlsRef}
                    formRef={formRef}
                    resetControls={resetControls}
                  ></Message>
                ))}
              </InfiniteScroll>
            ) : (
              "there is nothing yet"
            )}
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
