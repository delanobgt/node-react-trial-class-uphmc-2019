import React, { Fragment } from "react";
import { compose } from "redux";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  back: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "-10",
    backgroundColor: "#1b1a17"
  },
  front: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "-9",
    backgroundImage: `
      url(${require("../../res/images/bottom_left.png")}), 
      url(${require("../../res/images/bottom_right.png")}),
      url(${require("../../res/images/top_left.png")}),
      url(${require("../../res/images/top_right.png")})
    `,
    backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
    backgroundPosition:
      "left 0 bottom 0, right 0 bottom 0, left 0 top 0, right 0 top 0",
    backgroundSize: "18em, 18em, 8em, 8em"
  }
});

class Background extends React.Component {
  render() {
    const { classes, opacity } = this.props;

    return (
      <Fragment>
        <div className={classes.back} />
        <div className={classes.front} style={{ opacity: opacity || 1 }} />
      </Fragment>
    );
  }
}

export default compose(withStyles(styles))(Background);
