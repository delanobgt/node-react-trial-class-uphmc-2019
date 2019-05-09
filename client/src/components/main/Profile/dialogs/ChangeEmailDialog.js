import _ from "lodash";
import React, { Fragment } from "react";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

import * as authActions from "../../../../actions/auth";
import * as snackbarActions from "../../../../actions/snackbar";

const styles = theme => ({
  formControl: { minWidth: "250px" },
  submitInfo: {
    marginTop: "1em",
    color: "red"
  }
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = {
  submitStatus: IDLE
};

class ChangeEmailDialog extends React.Component {
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

  onSubmit = async formValues => {
    const {
      updateSelfEmail,
      successSnackbar,
      errorSnackbar,
      reset
    } = this.props;
    try {
      this.setState({ submitStatus: SUBMITTING });
      await updateSelfEmail(_.pick(formValues, ["email"]));
      this.onClose();
      successSnackbar(`Email changed`);
      reset();
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
    const { submitInfo, submitStatus } = this.state;
    return (
      <div>
        <Dialog open={Boolean(state[name])} aria-labelledby="form-dialog-title">
          <Fragment>
            <form onSubmit={handleSubmit(this.onSubmit)}>
              <DialogTitle id="form-dialog-title">Change Email</DialogTitle>
              <DialogContent>
                <FormControl
                  component="fieldset"
                  className={classes.formControl}
                >
                  <FormGroup>
                    <Field
                      name="email"
                      type="email"
                      label="New Email"
                      fullWidth
                      component={this.renderField}
                      className={classes.textField}
                      disabled={submitStatus === SUBMITTING}
                    />
                  </FormGroup>
                  <Typography variant="body1" className={classes.submitInfo}>
                    {submitInfo}
                  </Typography>
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
                  disabled={submitStatus === SUBMITTING || pristine}
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

  const emailTest = value =>
    value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
  if (!values.email) errors.email = "Please specify an email!";
  else if (emailTest(values.email)) errors.email = "Invalid email address!";

  return errors;
}

function mapStateToProps(state) {
  return {
    ...state.auth,
    initialValues: {
      ...state.auth
    }
  };
}

const withStylesDecorated = withStyles(styles)(ChangeEmailDialog);
const reduxFormDecorated = reduxForm({
  validate,
  form: "ChangeEmail",
  enableReinitialize: true
})(withStylesDecorated);
const connectDecorated = connect(
  mapStateToProps,
  { ...authActions, ...snackbarActions }
)(reduxFormDecorated);
export default connectDecorated;
