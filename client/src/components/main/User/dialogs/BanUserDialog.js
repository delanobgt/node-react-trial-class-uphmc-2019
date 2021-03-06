import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import * as userActions from "../../../../actions/user";
import * as snackbarActions from "../../../../actions/snackbar";

const styles = theme => ({
  textField: {
    margin: "0.5em 0"
  },
  formControl: {}
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = {
  submitStatus: IDLE
};

class BanUserDialog extends React.Component {
  state = INITIAL_STATE;

  onSubmit = async () => {
    const {
      updateUserById,
      successSnackbar,
      errorSnackbar,
      state,
      name
    } = this.props;
    const user = state[name] || {};

    try {
      this.setState({ submitStatus: SUBMITTING });
      await updateUserById(user._id, { banned: Boolean(!user.banned) });
      this.onClose();
      successSnackbar(`User ${user.banned ? "unbanned" : "banned"}`);
    } catch (error) {
      console.log({ error });
      errorSnackbar(
        _.get(
          error,
          "response.data.error.msg",
          `Can't ${user.banned ? "unban" : "ban"} user!`
        )
      );
    } finally {
      this.setState({ submitStatus: IDLE });
    }
  };

  onClose = () => {
    const { name, toggleDialog } = this.props;
    toggleDialog(name)(false);
    this.setState(INITIAL_STATE);
  };

  render() {
    const { state, name } = this.props;
    const { submitStatus } = this.state;
    const user = state[name];

    if (!user) return null;

    return (
      <div>
        <Dialog open={Boolean(state[name])} aria-labelledby="form-dialog-title">
          <Fragment>
            <DialogTitle id="form-dialog-title">
              {user.banned
                ? "Unban User Confirmation"
                : "Ban User Confirmation"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="subtitle1">
                  {user.banned ? (
                    <div>
                      Unban <span style={{ color: "blue" }}>{user.email}</span>
                      's account?
                    </div>
                  ) : (
                    <div>
                      Ban <span style={{ color: "blue" }}>{user.email}</span>'s
                      account?
                    </div>
                  )}
                </Typography>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.onClose}
                color="primary"
                disabled={submitStatus === SUBMITTING}
              >
                No
              </Button>
              <Button
                onClick={this.onSubmit}
                color="secondary"
                disabled={submitStatus === SUBMITTING}
              >
                {submitStatus === SUBMITTING ? (
                  <CircularProgress size={24} />
                ) : (
                  "Yes"
                )}
              </Button>
            </DialogActions>
          </Fragment>
        </Dialog>
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    null,
    { ...userActions, ...snackbarActions }
  )
)(BanUserDialog);
