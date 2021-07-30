import React from "react";

type AvatarProps = {
  parent: string;
  src: string;
  className?: string;
};

export default function Avatar({ parent, src, className }: AvatarProps) {
  return (
    <div
      className={`${parent}__avatar-container avatar-container ${
        className ? className : ""
      }`}
    >
      <div className={`${parent}__avatar-border avatar-border`}></div>
      <img
        className={`${parent}__avatar avatar ${
          src ? "" : `${parent}__avatar_default`
        }`}
        src={src || "../avatar.png"}
      ></img>
    </div>
  );
}
