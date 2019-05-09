import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";

import * as navActions from "../../../actions/nav";
import NestedList from "./NestedList";

const styles = {
  list: {
    width: 250
  },
  fullList: {
    width: "auto"
  }
};

class TemporaryDrawer extends React.Component {
  render() {
    const { classes } = this.props;

    const sideList = (
      <div className={classes.list}>
        <NestedList />
      </div>
    );

    return (
      <div>
        <Drawer
          open={this.props.drawerOpen}
          onClose={() => this.props.toggleDrawerOpen(false)}
        >
          <div
            tabIndex={0}
            role="button"
            onKeyDown={() => this.props.toggleDrawerOpen(false)}
          >
            {sideList}
          </div>
        </Drawer>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    drawerOpen: state.nav.drawerOpen
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    navActions
  )
)(TemporaryDrawer);
