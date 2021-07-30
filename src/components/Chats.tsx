import {
  getDatabase,
  off,
  onValue,
  orderByChild,
  query,
  ref,
} from "firebase/database";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MessageObject } from "./Chat";
import LastMessage from "./LastMessage";

export default function Chats() {
  const [lastMessages, setLastMessages] = useState<MessageObject[]>([]);

  const { currentUser } = useAuth();

  const db = getDatabase();

  function watchLastChats() {
    const chatsRef = ref(db, "chats/" + currentUser!.uid);
    const refWithSort = query(chatsRef, orderByChild("createdAt"));
    onValue(refWithSort, (snapshot) => {
      const lastMessages: MessageObject[] = [];
      snapshot.forEach((childSnapshot) => {
        lastMessages.push(childSnapshot.val());
      });
      setLastMessages(lastMessages.reverse());
    });
  }

  useEffect(() => {
    watchLastChats();
    return () => {
      // this actualy ruins message counter
      //cause its also attached on chats/user
      //    const chatsRef = ref(db, "chats/" + currentUser!.uid);
      //  off(chatsRef);
    };
  }, []);

  return (
    <div className="page page_centralized container">
      <div className="chats bordered-container glassed-container">
        <div className="chats__header section-header stone-bordered">chats</div>
        {lastMessages.map((item, index) => (
          <LastMessage
            key={`${item.createdAt}${index}`}
            {...item}
          ></LastMessage>
        ))}
      </div>
    </div>
  );
}
