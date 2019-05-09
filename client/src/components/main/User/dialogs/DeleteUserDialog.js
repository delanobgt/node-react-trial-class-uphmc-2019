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

class DeleteUserDialog extends React.Component {
  state = INITIAL_STATE;

  onSubmit = async () => {
    const {
      deleteUserById,
      successSnackbar,
      errorSnackbar,
      state,
      name
    } = this.props;
    const user = state[name] || {};

    try {
      this.setState({ submitStatus: SUBMITTING });
      await deleteUserById(user._id);
      this.onClose();
      successSnackbar(`User deleted`);
    } catch (error) {
      errorSnackbar(
        _.get(error, "response.data.error.msg", `Can't delete user!`)
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
              Delete User Confirmation
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="subtitle1">
                  Delete <span style={{ color: "blue" }}>{user.email}</span>'s
                  account permanently?
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
)(DeleteUserDialog);
