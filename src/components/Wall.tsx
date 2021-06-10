import React, { DOMElement, FormEvent, useState } from "react";
import { isTemplateExpression } from "typescript";
import Post from "./Post";

export default function Wall() {
  const [isTelling, setIsTelling] = useState(false);

  function activateInput() {
    setIsTelling(true);
  }

  function disableInput() {
    setIsTelling(false);
  }
  function centerElement(event: FormEvent<HTMLTextAreaElement>) {
    const textarea = event.target as HTMLTextAreaElement;
    const container = textarea.parentElement as HTMLDivElement;
    const containerWidth = container.offsetWidth;
    const destination = containerWidth! / 2 - textarea.offsetWidth / 2;
    const header = container.querySelector(
      ".tell-your-story__label"
    ) as HTMLSpanElement;
    const destination2 = containerWidth! / 2 - header.offsetWidth / 2;

    const left = textarea.offsetLeft - destination;
    const left2 = header.offsetLeft - destination2;

    container.style.paddingBottom = 75 + "px";
    container.style.border = "10px solid white";
    textarea.style.left = -left + "px";
    textarea.style.top = 50 + "px";
    header.style.left = -left2 + "px";
    setIsTelling(true);
  }

  function uncenterElement(event: FormEvent<HTMLTextAreaElement>) {
    const textarea = event.target as HTMLTextAreaElement;
    const container = textarea.parentElement as HTMLDivElement;
    const header = container.querySelector(
      ".tell-your-story__label"
    ) as HTMLSpanElement;
    textarea.style.left = "";
    textarea.style.top = "";
    container.style.paddingBottom = "";
    header.style.left = "";
    container.style.border = "";
    setIsTelling(false);
  }

  return (
    <div className="wall">
      <div
        className={
          (isTelling ? "wall__form_active " : "") +
          "wall__form tell-your-story brick-bordered "
        }
      >
        <span className="tell-your-story__label">tell your story</span>
        <textarea
          onBlur={uncenterElement}
          onFocus={centerElement}
          id="tell-your-story"
          className="form__input tell-your-story__input"
        ></textarea>
      </div>
      <Post></Post>
      <Post></Post>
      <Post></Post>
    </div>
  );
}
