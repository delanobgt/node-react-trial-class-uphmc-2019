import "./style.css";
import React from "react";
import P5Wrapper from "react-p5-wrapper";
import sketch from "./sketch";

export default () => {
  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        zIndex: "-5"
      }}
    >
      <P5Wrapper sketch={sketch} />
    </div>
  );
};
