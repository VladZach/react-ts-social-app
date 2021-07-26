import { getDatabase, off, onValue, ref } from "firebase/database";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MessageObject } from "./Chat";
import LastMessage from "./LastMessage";

export default function Chats() {
  const [lastMessages, setLastMessages] = useState<MessageObject[]>([]);

  const { currentUser } = useAuth();

  const db = getDatabase();

  function getLastChats() {
    const chatsRef = ref(db, "chats/" + currentUser!.uid);
    onValue(chatsRef, (snapshot) => {
      const lastMessages: MessageObject[] = [];
      snapshot.forEach((childSnapshot) => {
        lastMessages.push(childSnapshot.val());
      });
      setLastMessages(lastMessages);
    });
  }

  useEffect(() => {
    getLastChats();
    return () => {
      const chatsRef = ref(db, "chats/" + currentUser!.uid);
      off(chatsRef);
    };
  }, []);

  return (
    <div className="page page_centralized container">
      <div className="chats bordered-container glassed-container">
        <div className="chats__header section-header stone-bordered">chats</div>
        {lastMessages.map((item) => (
          <LastMessage {...item}></LastMessage>
        ))}
      </div>
    </div>
  );
}
