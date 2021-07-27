import React, { useRef, useEffect, MouseEvent } from "react";
import { SelectedMessageProps } from "./Chat";

interface MessageProps {
  id: string;
  text: string;
  isMine: boolean;
  hasScionOnBottom?: boolean;
  hasScionOnTop?: boolean;
  setSelectedMessage: React.Dispatch<
    React.SetStateAction<null | SelectedMessageProps>
  >;
  controlsRef: React.MutableRefObject<HTMLDivElement | undefined>;
  formRef: React.MutableRefObject<HTMLFormElement | undefined>;
  resetControls: () => void;
}

export default function Message({
  id,
  text,
  hasScionOnBottom,
  isMine,
  hasScionOnTop,
  setSelectedMessage,
  controlsRef,
  formRef,
  resetControls,
}: MessageProps) {
  const className = hasScionOnBottom
    ? "thought-bubble__body thought-bubble__body-right"
    : hasScionOnTop
    ? "thought-bubble__body thought-bubble__body-left"
    : "thought-bubble__body message_round";
  const alignmentClass = isMine
    ? "message_from-me"
    : "message_from-interlocutor";
  const messageRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: React.MouseEvent<HTMLDivElement>) {
      if (
        messageRef.current &&
        !messageRef.current.contains(event.target as HTMLDivElement) &&
        !controlsRef.current?.contains(event.target as HTMLDivElement) &&
        !formRef.current?.contains(event.target as HTMLDivElement)
      ) {
        setSelectedMessage(null);
        resetControls();
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside as any);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside as any);
    };
  }, [messageRef]);

  return (
    <div
      onClick={() => {
        setSelectedMessage({ text: text, id: id });
      }}
      ref={messageRef}
      className={"thought-bubble thought-bubble__message " + alignmentClass}
    >
      <div className={className}>
        <span className="thought-bubble__text">{text}</span>
      </div>
      {hasScionOnBottom ? (
        <>
          <div className="thought-bubble__decoration-black thought-bubble-right__decoration-black"></div>
          <div className="thought-bubble__decoration-white thought-bubble-right__decoration-white"></div>
        </>
      ) : hasScionOnTop ? (
        <>
          <div className="thought-bubble__decoration-black thought-bubble-left__decoration-black"></div>
          <div className="thought-bubble__decoration-white thought-bubble-left__decoration-white"></div>
        </>
      ) : (
        ""
      )}
    </div>
  );
}
