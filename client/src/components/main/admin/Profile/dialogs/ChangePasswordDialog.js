import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";

import * as authActions from "../../../../../actions/auth";
import * as snackbarActions from "../../../../../actions/snackbar";

const styles = theme => ({
  passwordField: {
    margin: "0.5em 0"
  },
  formControl: { minWidth: "375px" }
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = { submitStatus: IDLE };

class ChangPasswordDialog extends React.Component {
  state = INITIAL_STATE;

  renderField = field => {
    let { touched, error } = field.meta;
    if (error && Array.isArray(error)) {
      error = error.length
        ? error.map(rule => (
            <li key={rule} style={{ marginLeft: "1.2em", color: "red" }}>
              {rule}
            </li>
          ))
        : null;
    }
    return (
      <TextField
        {...field}
        {...field.input}
        fullWidth
        autoComplete="off"
        helperText={touched ? <div style={{ color: "red" }}>{error}</div> : ""}
      />
    );
  };

  onSubmit = async formProps => {
    const { oldPassword, newPassword } = formProps;
    const {
      updateSelfPassword,
      successSnackbar,
      errorSnackbar,
      toggleDialog,
      name,
      reset
    } = this.props;
    try {
      this.setState({ submitStatus: SUBMITTING });
      await updateSelfPassword({ oldPassword, newPassword });
      this.setState(INITIAL_STATE);
      this.onClose();
      successSnackbar(`Password changed`);
    } catch (error) {
      errorSnackbar(
        _.get(error, "response.data.error.msg", `Please try again`)
      );
    } finally {
      this.setState({ submitStatus: IDLE });
    }
  };

  onClose = () => {
    const { name, toggleDialog, reset } = this.props;
    toggleDialog(name)(false);
    this.setState(INITIAL_STATE);
    reset();
  };

  render() {
    const { classes, state, name, handleSubmit, pristine } = this.props;
    const { submitStatus } = this.state;

    return (
      <div>
        <Dialog open={Boolean(state[name])} aria-labelledby="form-dialog-title">
          <Fragment>
            <form onSubmit={handleSubmit(this.onSubmit)}>
              <DialogTitle id="form-dialog-title">Change Password</DialogTitle>
              <DialogContent>
                <DialogContentText>{/* nothing */}</DialogContentText>
                <FormControl
                  component="fieldset"
                  className={classes.formControl}
                >
                  <FormGroup>
                    <Field
                      name="oldPassword"
                      type="password"
                      label="Old Password"
                      component={this.renderField}
                      className={classes.passwordField}
                      disabled={submitStatus === SUBMITTING}
                      fullWidth
                    />
                    <Field
                      name="newPassword"
                      type="password"
                      label="New Password"
                      component={this.renderField}
                      className={classes.passwordField}
                      disabled={submitStatus === SUBMITTING}
                      fullWidth
                    />
                    <Field
                      name="confirmNewPassword"
                      type="password"
                      label="Confirm New Password"
                      component={this.renderField}
                      className={classes.passwordField}
                      disabled={submitStatus === SUBMITTING}
                      fullWidth
                    />
                  </FormGroup>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.onClose}
                  color="primary"
                  disabled={submitStatus === SUBMITTING}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={pristine || submitStatus === SUBMITTING}
                >
                  {submitStatus === SUBMITTING ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogActions>
            </form>
          </Fragment>
        </Dialog>
      </div>
    );
  }
}

function validate(values) {
  const errors = {};
  const { oldPassword, newPassword, confirmNewPassword } = values;

  if (!oldPassword) errors.oldPassword = "Please provide Old Password!";

  errors.newPassword = _.compact([
    !newPassword || newPassword.length < 8
      ? `Password must be at least 8 (${
          newPassword ? newPassword.length : 0
        }/8)`
      : null,
    !newPassword || newPassword.search(/[a-z]/g) === -1
      ? "Password must contain at least 1 lowercase character"
      : null,
    !newPassword || newPassword.search(/[A-Z]/g) === -1
      ? "Password must contain at least 1 uppercase character"
      : null,
    !newPassword || newPassword.search(/[0-9]/g) === -1
      ? "Password must contain at least 1 digit"
      : null
  ]);
  if (!errors.newPassword.length) delete errors["newPassword"];

  if (!confirmNewPassword)
    errors.confirmNewPassword = "Please rewrite your password!";
  else if (newPassword !== confirmNewPassword)
    errors.confirmNewPassword = "Passwords do not match!";

  return errors;
}

export default compose(
  withStyles(styles),
  reduxForm({ validate, form: "ChangePassword" }),
  connect(
    null,
    { ...authActions, ...snackbarActions }
  )
)(ChangPasswordDialog);
