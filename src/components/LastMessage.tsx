import React, { useState, useEffect } from "react";
import { UserData } from "./UserProfile";
import { getDatabase, ref, get } from "@firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { MessageProps } from "./Chat";
import { formDate } from "./Post";
import { Link } from "react-router-dom";
import { getPathByUsers } from "./Chat";
import { getUserData } from "./UserProfile";

export default function LastMessage({
  text,
  createdAt,
  author,
  interlocutor,
}: MessageProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { currentUser } = useAuth();

  useEffect(() => {
    getUserData(author).then((snapshot) => setUserData(snapshot.val()));
  }, []);

  useEffect(() => {
    if (userData) {
      setIsLoading(false);
    }
  }, [userData]);

  return (
    <Link to={"chat/" + interlocutor}>
      <div className="last-message post stone-bordered">
        <div className="last-message__header">
          <div className="last-message__info post__info">
            <div className="last-message__avatar-container post__avatar-container">
              <div className="last-message__avatar-border post__avatar-border"></div>
              <img
                className="last-message__avatar post__avatar"
                src={userData?.photoUrl ? userData.photoUrl : "../avatar.jpg"}
              ></img>
            </div>
            <p className="last-message__author-name post__author-name">
              {userData?.fullName}
            </p>
            <p className="last-message__created-at post__created-at">
              {formDate(createdAt)}
            </p>
          </div>
        </div>
        <span className="last-message__text post__text">{text}</span>
      </div>
    </Link>
  );
}
