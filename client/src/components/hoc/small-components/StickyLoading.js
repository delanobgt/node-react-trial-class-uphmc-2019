import React from "react";

export default () => {
  const fixedStyle = {
    position: "fixed",
    left: "50%",
    top: "0",
    transform: "translate(-50%, 0)",
    fontFamily: "Roboto",
    color: "black",
    background: "#FFFF99",
    borderLeft: "2px solid #999900",
    borderRight: "2px solid #999900",
    borderBottom: "2px solid #999900",
    borderBottomLeftRadius: "5px",
    borderBottomRightRadius: "5px",
    padding: "0.35em 0.5em",
    textAlign: "center",
    width: "4.5em",
    zIndex: "10"
  };

  return <div style={fixedStyle}>Loading...</div>;
};
