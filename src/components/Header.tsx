import {
  getDatabase,
  onValue,
  ref,
  off,
  get,
  onChildChanged,
  onChildAdded,
} from "firebase/database";
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const [messagesCounter, setMessagesCounter] = useState(0);
  const { currentUser } = useAuth();
  const db = getDatabase();

  function watchMessagesCounter() {
    const chatsRef = ref(db, "chats/" + currentUser!.uid);
    //for changes in already existing chats
    onChildChanged(chatsRef, (chat) => {
      //OnChildSomething-observers put in callback only that exactly
      // child on which "Something" happened
      getInitialMessagesCounter();
    });
    //for first message in newly created chat
    onChildAdded(chatsRef, (chat) => {
      getInitialMessagesCounter();
    });
  }
  async function getInitialMessagesCounter() {
    const chatsRef = ref(db, "chats/" + currentUser!.uid + "/");
    const chats = await get(chatsRef);
    let counter = 0;
    chats.forEach((chat) => {
      if (!chat.val().wasRed) {
        counter++;
      }
    });
    setMessagesCounter(counter);
  }

  useEffect(() => {
    watchMessagesCounter();
    return () => {
      off(ref(db, "chats/" + currentUser!.uid + "/"));
    };
  }, []);

  return (
    <div className="header container">
      <NavLink to="/">
        <div className="header_logo">Another Social App</div>
      </NavLink>
      <div className="header__controls">
        <NavLink to="/news">
          <svg
            className="header__icon icon news-icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid meet"
            viewBox="104.86936936936831 398.8378378378391 148.7297297297293 164.81081081080941"
            width="72"
            height="80"
          >
            <defs>
              <path
                d="M113.91 552.61L242.56 552.61L242.56 488.28L250.6 488.28L250.6 560.65L105.87 560.65L105.87 496.32L113.91 496.32L113.91 496.32L113.91 552.61ZM202.36 544.57L170.19 544.57L170.19 536.53L202.36 536.53L202.36 536.53L202.36 544.57ZM162.15 544.57L129.99 544.57L129.99 536.53L162.15 536.53L162.15 536.53L162.15 544.57ZM226.48 456.12L226.48 536.53L210.4 536.53L210.4 456.12L210.4 456.12L226.48 456.12ZM202.36 528.49L170.19 528.49L170.19 520.45L202.36 520.45L202.36 520.45L202.36 528.49ZM162.15 528.49L129.99 528.49L129.99 520.45L162.15 520.45L162.15 520.45L162.15 528.49ZM202.36 512.41L170.19 512.41L170.19 504.36L202.36 504.36L202.36 504.36L202.36 512.41ZM162.15 512.41L129.99 512.41L129.99 504.36L162.15 504.36L162.15 504.36L162.15 512.41ZM202.36 496.32L170.19 496.32L170.19 488.28L202.36 488.28L202.36 488.28L202.36 496.32ZM162.15 496.32L129.99 496.32L129.99 488.28L162.15 488.28L162.15 488.28L162.15 496.32ZM113.91 496.32L105.87 496.32L105.87 415.92L113.91 415.92L113.91 415.92L113.91 496.32ZM250.6 488.28L242.56 488.28L242.56 423.96L250.6 423.96L250.6 423.96L250.6 488.28ZM202.36 480.24L170.19 480.24L170.19 472.2L202.36 472.2L202.36 472.2L202.36 480.24ZM162.15 480.24L129.99 480.24L129.99 472.2L162.15 472.2L162.15 472.2L162.15 480.24ZM162.15 464.16L129.99 464.16L129.99 456.12L162.15 456.12L162.15 456.12L162.15 464.16ZM202.36 464.16L170.19 464.16L170.19 456.12L202.36 456.12L202.36 456.12L202.36 464.16ZM226.48 448.08L170.19 448.08L170.19 415.92L226.48 415.92L226.48 415.92L226.48 448.08ZM162.15 448.08L129.99 448.08L129.99 440.04L162.15 440.04L162.15 440.04L162.15 448.08ZM162.15 432L129.99 432L129.99 423.96L162.15 423.96L162.15 423.96L162.15 432ZM105.87 407.88L105.87 399.84L250.6 399.84L250.6 423.96L242.56 423.96L242.56 407.88L242.56 407.88L105.87 407.88ZM113.91 415.92L105.87 415.92L105.87 407.88L113.91 407.88L113.91 407.88L113.91 415.92Z"
                id="b3lxzbhWmK"
              ></path>
            </defs>
            <g className="icon__outer-group">
              <use
                xlinkHref="#b3lxzbhWmK"
                opacity="1"
                fill="#000000"
                fillOpacity="1"
              ></use>
            </g>
          </svg>
        </NavLink>
        <NavLink to="/search-people">
          <svg
            className="header__icon icon search-people-icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid meet"
            viewBox="394.9878378378373 122.88070175438662 100.48648648648606 84.40540540540519"
            width="96.49"
            height="80.41"
          >
            <defs>
              <path
                d="M468.35 188.21L468.35 204.29L460.31 204.29L460.31 188.21L452.27 188.21L452.27 180.16L460.31 180.16L460.31 188.21L468.35 188.21ZM404.03 188.21L404.03 204.29L395.99 204.29L395.99 188.21L404.03 188.21L404.03 180.16L420.11 180.16L420.11 188.21L404.03 188.21ZM444.23 172.12L444.23 180.16L452.27 180.16L452.27 188.21L444.23 188.21L444.23 180.16L436.19 180.16L436.19 172.12L444.23 172.12L444.23 164.08L452.27 164.08L452.27 172.12L444.23 172.12ZM420.11 180.16L420.11 172.12L428.15 172.12L428.15 180.16L420.11 180.16ZM412.07 172.12L412.07 164.08L420.11 164.08L420.11 172.12L412.07 172.12ZM404.03 164.08L404.03 139.96L412.07 139.96L412.07 164.08L404.03 164.08ZM452.27 164.08L452.27 139.96L460.31 139.96L460.31 164.08L452.27 164.08ZM412.07 139.96L412.07 131.92L420.11 131.92L420.11 139.96L412.07 139.96ZM444.23 123.88L444.23 131.92L452.27 131.92L452.27 139.96L444.23 139.96L444.23 131.92L420.11 131.92L420.11 123.88L444.23 123.88Z"
                id="nO7XL1fO1"
              ></path>
              <path
                d="M484.43 143.98L492.47 143.98L492.47 152.02L484.43 152.02L484.43 160.06L476.39 160.06L476.39 152.02L468.35 152.02L468.35 143.98L476.39 143.98L476.39 135.94L484.43 135.94L484.43 143.98Z"
                id="b2joDfYrY"
              ></path>
              <path
                d="M444.19 172.12L436.23 172.12L436.23 180.16L444.27 180.16L444.27 188.21L460.27 188.21L460.27 204.29L404.07 204.29L404.07 188.21L420.15 188.21L420.15 180.16L428.19 180.16L428.19 172.12L420.07 172.12L420.07 164.08L412.11 164.08L412.11 156.04L412.11 156.04L412.11 139.96L420.15 139.96L420.15 131.92L444.27 131.92L444.27 139.96L452.31 139.96L452.31 164.08L444.19 164.08L444.19 164.08L444.19 172.12Z"
                id="a18n4l2kIv"
              ></path>
            </defs>
            <g className="icon__outer-group">
              <use
                xlinkHref="#nO7XL1fO1"
                opacity="1"
                fill="#000000"
                fillOpacity="1"
              ></use>
              <use
                xlinkHref="#b2joDfYrY"
                opacity="1"
                fill="#000000"
                fillOpacity="1"
              ></use>
            </g>

            <g className="icon__inner-group">
              <use
                xlinkHref="#a18n4l2kIv"
                opacity="1"
                fill="#ffffff"
                fillOpacity="1"
              ></use>
            </g>
          </svg>
        </NavLink>
        <NavLink to="/chats">
          <svg
            className="header__icon icon messages-icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid meet"
            viewBox="250.62612612612662 122.88070175438662 108.52702702702675 84.40540540540519"
            width="104.53"
            height="80.41"
          >
            <defs>
              <path
                d="M259.67 204.29L259.67 196.25L348.11 196.25L348.11 204.29L259.67 204.29ZM348.11 196.25L348.11 139.96L340.07 139.96L340.07 148L332.03 148L332.03 139.96L340.07 139.96L340.07 131.92L356.15 131.92L356.15 196.25L348.11 196.25ZM267.71 131.92L267.71 139.96L259.67 139.96L259.67 196.25L251.63 196.25L251.63 131.92L267.71 131.92L267.71 123.88L340.07 123.88L340.07 131.92L267.71 131.92ZM299.87 180.16L299.87 172.12L307.91 172.12L307.91 180.16L299.87 180.16ZM299.87 164.08L299.87 172.12L291.83 172.12L291.83 164.08L283.79 164.08L283.79 156.04L291.83 156.04L291.83 164.08L299.87 164.08ZM315.95 164.08L315.95 172.12L307.91 172.12L307.91 164.08L315.95 164.08L315.95 156.04L323.99 156.04L323.99 164.08L315.95 164.08ZM275.75 156.04L275.75 148L283.79 148L283.79 156.04L275.75 156.04ZM323.99 156.04L323.99 148L332.03 148L332.03 156.04L323.99 156.04ZM267.71 148L267.71 139.96L275.75 139.96L275.75 148L267.71 148Z"
                id="d2CNLACt9S"
              ></path>
              <path
                d="M348.12 139.94L348.12 164.06L332.04 164.06L332.04 164.08L348.12 164.08L348.12 196.25L299.87 196.25L299.87 188.21L299.86 188.21L299.86 196.25L259.66 196.25L259.66 139.96L267.7 139.96L267.7 131.92L299.86 131.92L299.86 148L299.87 148L299.87 131.92L340.08 131.92L340.08 139.94L348.12 139.94ZM267.7 148L275.74 148L275.74 156.04L283.78 156.04L283.78 164.08L291.82 164.08L291.82 172.12L299.86 172.12L299.86 180.16L307.91 180.16L307.91 188.21L307.91 188.21L307.91 172.12L315.95 172.12L315.95 164.08L324 164.08L324 156.04L332.04 156.04L332.04 148L324 148L324 156.04L315.95 156.04L315.95 164.08L307.91 164.08L307.91 172.12L299.86 172.12L299.86 164.08L299.87 164.08L299.87 156.04L299.86 156.04L299.86 164.08L291.82 164.08L291.82 156.04L283.78 156.04L283.78 148L275.74 148L275.74 139.96L267.7 139.96L267.7 148ZM307.91 156.04L307.91 156.04L307.91 148L307.91 148L307.91 156.04ZM332.04 147.98L340.08 147.98L340.08 139.96L332.04 139.96L332.04 147.98Z"
                id="a7ImCHT3G9"
              ></path>
            </defs>
            <g
              className={`icon__outer-group ${
                messagesCounter ? "messages-icon__outer-group" : ""
              }`}
            >
              <use
                xlinkHref="#d2CNLACt9S"
                opacity="1"
                fill="#000000"
                fillOpacity="1"
              ></use>
            </g>
            <g
              className={`icon__inner-group ${
                messagesCounter ? "messages-icon__inner-group" : ""
              }`}
            >
              <use
                xlinkHref="#a7ImCHT3G9"
                opacity="1"
                fill="#ffe700"
                fillOpacity="1"
              ></use>
            </g>
          </svg>
          {messagesCounter ? (
            <span className="messages-icon__counter">{messagesCounter}</span>
          ) : null}
        </NavLink>
      </div>
    </div>
  );
}
