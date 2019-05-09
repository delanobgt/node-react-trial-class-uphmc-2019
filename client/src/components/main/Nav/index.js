import React, { Component, Fragment } from "react";

import requireAuth from "../../hoc/requireAuth";
import AppBar from "./AppBar";
import Drawer from "./Drawer";

class Nav extends Component {
  render() {
    return (
      <Fragment>
        <AppBar />
        <Drawer />
        <br />
        <br />
      </Fragment>
    );
  }
}

export default requireAuth(Nav);
