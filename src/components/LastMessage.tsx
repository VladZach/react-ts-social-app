import React, { useState, useEffect } from "react";
import { UserData } from "./UserProfile";
import { useAuth } from "../contexts/AuthContext";
import { MessageObject } from "./Chat";
import { formateDate } from "./Post";
import { Link } from "react-router-dom";
import { getUserData } from "./UserProfile";

export default function LastMessage({
  text,
  createdAt,
  authorId,
  interlocutorId,
}: MessageObject) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { currentUser } = useAuth();

  useEffect(() => {
    getUserData(interlocutorId as string).then((snapshot) =>
      setUserData(snapshot.val())
    );
  }, []);

  useEffect(() => {
    if (userData) {
      setIsLoading(false);
    }
  }, [userData]);

  return (
    <Link className="chats__link" to={"chat/" + interlocutorId}>
      <div className="last-message post stone-bordered">
        <div className="last-message__header post__header">
          <div className="last-message__info">
            <div className="last-message__avatar-container post__avatar-container avatar-container">
              <div className="last-message__avatar-border post__avatar-border avatar-border"></div>
              <img
                className="last-message__avatar post__avatar avatar"
                src={userData?.photoUrl ? userData.photoUrl : "../avatar.png"}
              ></img>
            </div>
            <p className="last-message__author-name post__author-name">
              {userData?.fullName}
            </p>
            <p className="last-message__created-at post__created-at">
              {formateDate(createdAt as string)}
            </p>
          </div>
        </div>
        <span className="last-message__text post__text">
          {currentUser!.uid === authorId ? "You: " + text : text}
        </span>
      </div>
    </Link>
  );
}
