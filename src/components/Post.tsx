import React from "react";

export default function Post() {
  return (
    <div className="post brick-bordered">
      <div className="post__header">
        <div className="post__info">
          <div className="post__avatar-container">
            <div className="post__avatar-border"></div>
            <img className="post__avatar" src="./avatar.jpg"></img>
          </div>
          <p className="post__author-name">Ваня Петров</p>
          <p className="post__created-at">5 сен 2020 16:05</p>
        </div>
        <div className="post__controls controls">
          <span className="controls__button">edit</span>
          <span className="controls__button">delete</span>
        </div>
      </div>
      <span className="post__text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
        sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </span>
      <div className="post__footer">
        <img className="post__icon comment-icon" src="./comment-icon.svg"></img>
        <img className="post__icon like-icon" src="./like-icon.png"></img>
      </div>
    </div>
  );
}
