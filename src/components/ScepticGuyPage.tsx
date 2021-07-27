import React, {
  ReactChild,
  ReactComponentElement,
  ReactElement,
  ReactNode,
  useState,
} from "react";
import { ElementType } from "react";
import { RouteComponentProps } from "react-router-dom";
import WelcomePageHeader from "./WelcomePageHeader";

export interface ScepticGuyPageProps {
  setGif: React.Dispatch<React.SetStateAction<string>>;
  setSubmissionError: React.Dispatch<React.SetStateAction<string>>;
  setErrors: React.Dispatch<React.SetStateAction<string[]>>;
}

interface Props {
  child: React.ComponentType<ScepticGuyPageProps>;
  hasHeader: boolean;
  heading: string;
}

export default function ScepticGuyPage({
  child: Child,
  heading,
  hasHeader,
}: Props) {
  const [gif, setGif] = useState("guy.gif");
  const [submissionError, setSubmissionError] = useState("");
  const [errors, setErrors] = useState<Array<string>>([]);

  // Checking isValidElement is the safe way and avoids a typescript
  // error too.
  return (
    <div className="page page_welcome-page page_centralized container">
      {hasHeader ? <WelcomePageHeader></WelcomePageHeader> : null}
      <div className="sceptic-guy">
        <div className="thought-bubble sceptic-guy__thought-bubble ">
          <div className="thought-bubble__body thought-bubble__body-right">
            <span className="thought-bubble__text">
              {submissionError
                ? submissionError
                : errors.length
                ? errors.join(" & ")
                : "...really?"}
            </span>
          </div>
          <div className="thought-bubble__decoration-black thought-bubble-right__decoration-black"></div>
          <div className="thought-bubble__decoration-white thought-bubble-right__decoration-white"></div>
        </div>
        <img className="sceptic-guy__image" src={`./${gif}`} />
      </div>
      <div className="card">
        <h2 className="card__item card__header">{heading}</h2>
        <Child
          setGif={setGif}
          setErrors={setErrors}
          setSubmissionError={setSubmissionError}
        ></Child>
      </div>
    </div>
  );
}
