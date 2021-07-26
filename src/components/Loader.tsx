import React from "react";
import { useEffect } from "react";
import { useState } from "react";

export default function Loader() {
  const [dots, setDots] = useState("");

  function changeLoaderText() {
    switch (dots.length) {
      case 0:
        setDots(".");
        break;
      case 1:
        setDots("..");
        break;
      case 2:
        setDots("...");
        break;
      case 3:
        setDots("");
        break;
    }
  }

  useEffect(() => {
    const timerId = setTimeout(changeLoaderText, 200);
    return () => clearTimeout(timerId);
  });

  return (
    <div className="loader">
      <span className="loader__word">loading</span>
      <span className="loader__dots">{dots}</span>
    </div>
  );
}
