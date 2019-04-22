import React from "react";
import { compose } from "redux";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  wrapper: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "-10",
    backgroundImage: `
      url(${require("../res/images/left_bottom.png")}), 
      url(${require("../res/images/right_bottom.png")}),
      url(${require("../res/images/left_mid.png")}),
      url(${require("../res/images/right_mid.png")}),
      linear-gradient(to right, #1b1a17, #1b1a17)`,
    backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
    backgroundPosition:
      "left 0 bottom 0, right 0 bottom 0, left 0 top 25%, right 0 top 25%",
    backgroundSize: "8em, 8em, 3.5em, 3.5em, 100%"
  }
});

class Background extends React.Component {
  render() {
    const { classes } = this.props;

    return <div className={classes.wrapper} />;
  }
}

export default compose(withStyles(styles))(Background);
