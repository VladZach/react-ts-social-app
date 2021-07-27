import {
  getDatabase,
  ref,
  get,
  set,
  onValue,
  off,
  update,
  remove,
} from "firebase/database";
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export interface UserDataWithId extends UserData {
  userId: string;
}

export function getUserData(userId: string) {
  const db = getDatabase();
  const userRef = ref(db, "users/" + userId);
  return get(userRef);
}

export interface UserData {
  fullName: string;
  aboutMe: string;
  photoUrl: string;
  whereFrom: string;
}

export default function UserProfile({
  fullName,
  aboutMe,
  photoUrl,
  whereFrom,
  userId,
}: UserDataWithId) {
  const { currentUser, logout } = useAuth();
  const isMine = currentUser!.uid === userId;
  const [isSubscribed, setIsSubscribed] = useState(false);
  const db = getDatabase();
  const history = useHistory();

  let placeholder = "????????????";

  async function subscribe() {
    const subscriptionRef = ref(
      db,
      "users/" + currentUser!.uid + "/subscriptions/" + userId
    );
    const subscriberRef = ref(
      db,
      "users/" + userId + "/subscribers/" + currentUser!.uid
    );
    const postsRef = ref(db, "users/" + userId + "/posts/");
    const newsRef = ref(db, "users/" + currentUser!.uid + "/news/");
    const postsSnapshot = await get(postsRef);
    if (postsSnapshot.val()) {
      await update(newsRef, postsSnapshot.val());
    }
    await set(subscriptionRef, true);
    await set(subscriberRef, true);
  }

  async function unsubscribe() {
    const subscriptionRef = ref(
      db,
      "users/" + currentUser!.uid + "/subscriptions/" + userId
    );
    const subscriberRef = ref(
      db,
      "users/" + userId + "/subscribers/" + currentUser!.uid
    );
    const postsRef = ref(db, "users/" + userId + "/posts/");
    const newsRef = ref(db, "users/" + currentUser!.uid + "/news/");
    const postsSnapshot = await get(postsRef);
    const posts: any = {};
    if (postsSnapshot.val()) {
      postsSnapshot.forEach((item) => {
        const key = item.key;
        posts[key!] = null;
      });
      await update(newsRef, posts);
    }
    await remove(subscriptionRef);
    await remove(subscriberRef);
  }

  function watchSubscription() {
    const subscriptionRef = ref(
      db,
      "users/" + currentUser!.uid + "/subscriptions/" + userId
    );
    onValue(subscriptionRef, (snapshot) => {
      setIsSubscribed(snapshot.val());
    });
  }

  useEffect(() => {
    watchSubscription();
    return () => {
      const subscriptionRef = ref(
        db,
        "users/" + currentUser!.uid + "/subscriptions/" + userId
      );
      off(subscriptionRef);
    };
  }, []);

  return (
    <div className="user-profile">
      <img
        src={photoUrl ? photoUrl : "./avatar.jpg"}
        className="user-avatar user-profile__avatar stone-bordered"
      ></img>
      <div className="user-info user-profile__info stone-bordered">
        <div className="user-info__header">
          <h3 className="user-name user-info__name">
            {fullName ? fullName : placeholder}
          </h3>
          {isMine ? (
            <div className="user-profile__controls controls">
              <span className="controls__button" onClick={logout}>
                log out
              </span>
              <span
                onClick={() => {
                  history.push(`/update-profile`);
                }}
                className="controls__button"
              >
                edit
              </span>
            </div>
          ) : (
            <div className="user-profile__controls controls">
              {isSubscribed ? (
                <span
                  className="controls__button"
                  onClick={(e) => {
                    e.preventDefault();
                    unsubscribe();
                  }}
                >
                  unsubscribe
                </span>
              ) : (
                <span
                  className="controls__button"
                  onClick={(e) => {
                    e.preventDefault();
                    subscribe();
                  }}
                >
                  subscribe
                </span>
              )}

              <span
                onClick={(e) => {
                  e.preventDefault();
                  history.push(`/chat/${userId}`);
                }}
                className="controls__button"
              >
                message
              </span>
            </div>
          )}
        </div>
        <div className="user-text user-info__text">
          <span className="user-text__header">from:</span>
          <span className="user-text__text">
            {whereFrom ? whereFrom : placeholder}
          </span>
        </div>
        <div className="user-text user-info__text">
          <span className="user-text__header">about me:</span>
          <span className="user-text__text">
            {aboutMe ? aboutMe : placeholder}
          </span>
        </div>
      </div>
    </div>
  );
}
