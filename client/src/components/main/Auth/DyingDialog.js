import React, { Component, Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Typography from "@material-ui/core/Typography";

import * as authActions from "../../../actions/auth";

class UncomfortableDialog extends Component {
  onRefresh = () => {
    window.location.reload();
  };

  onLogout = async () => {
    const { signOut, hideDyingDialog } = this.props;
    await signOut();
    await hideDyingDialog();
  };

  render() {
    const { showDyingDialog } = this.props;

    return (
      <div>
        <Dialog
          open={Boolean(showDyingDialog)}
          aria-labelledby="form-dialog-title"
          style={{ zIndex: 99999 }}
        >
          <Fragment>
            <DialogTitle id="form-dialog-title">
              <span style={{ color: "red" }}>{showDyingDialog}</span>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="subtitle2" />
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              {showDyingDialog === "Please check your internet connection!" ? (
                <Button onClick={this.onRefresh} color="primary">
                  Refresh
                </Button>
              ) : (
                <Button onClick={this.onLogout} color="primary">
                  Logout
                </Button>
              )}
            </DialogActions>
          </Fragment>
        </Dialog>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  };
}

export default compose(
  connect(
    mapStateToProps,
    { ...authActions }
  )
)(UncomfortableDialog);
