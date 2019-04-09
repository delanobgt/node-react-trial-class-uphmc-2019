import _ from "lodash";
import React, { Fragment } from "react";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";

import * as snackbarActions from "../../../../../actions/snackbar";
import * as userActions from "../../../../../actions/user";
import { compose } from "redux";

const styles = theme => ({
  formControl: { minWidth: "200px" }
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = {
  submitStatus: IDLE
};

class CreateUserDialog extends React.Component {
  state = INITIAL_STATE;

  renderField = field => {
    return (
      <TextField
        {...field}
        {...field.input}
        autoComplete="off"
        helperText={field.meta.touched ? field.meta.error : ""}
      />
    );
  };

  onSubmit = async formProps => {
    const {
      createUser,
      successSnackbar,
      errorSnackbar,
      toggleDialog,
      name
    } = this.props;

    try {
      this.setState({ submitStatus: SUBMITTING });
      await createUser({ email: formProps.email });
      this.onClose();
      successSnackbar(`User created.`);
    } catch (error) {
      console.log({ error });
      errorSnackbar(
        _.get(error, "response.data.error.msg", `Please try again!`)
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
    const { classes, state, name, handleSubmit } = this.props;
    const { submitStatus } = this.state;

    return (
      <div>
        <Dialog open={Boolean(state[name])} aria-labelledby="form-dialog-title">
          <Fragment>
            <form onSubmit={handleSubmit(this.onSubmit)}>
              <DialogTitle id="form-dialog-title">Create New User</DialogTitle>
              <DialogContent>
                <DialogContentText>{/* nothing */}</DialogContentText>
                <FormControl
                  component="fieldset"
                  className={classes.formControl}
                >
                  <FormGroup>
                    <Field
                      name="email"
                      type="text"
                      label="Email"
                      component={this.renderField}
                      className={classes.textField}
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
                  disabled={submitStatus === SUBMITTING}
                >
                  {submitStatus === SUBMITTING ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Create"
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
  const { email } = values;
  const errors = {};

  const emailTest = value =>
    value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
  if (!email) errors.email = "Please specify an email!";
  else if (emailTest(values.email)) errors.email = "Invalid email address!";

  return errors;
}

export default compose(
  withStyles(styles),
  connect(
    null,
    { ...userActions, ...snackbarActions }
  ),
  reduxForm({ validate, form: "CreateUser" })
)(CreateUserDialog);
