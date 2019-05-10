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
import DialogTitle from "@material-ui/core/DialogTitle";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";

import * as participantActions from "../../../../actions/participant";
import * as snackbarActions from "../../../../actions/snackbar";
import { compose } from "redux";

const styles = theme => ({
  formControl: { minWidth: "280px" },
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  }
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = {
  submitStatus: IDLE,
  courses: {}
};

class CreateParticipantDialog extends React.Component {
  state = INITIAL_STATE;

  renderField = field => {
    const { helperText } = field;
    const { error, touched } = field.meta;
    return (
      <TextField
        {...field}
        {...field.input}
        autoComplete="off"
        helperText={
          touched && error ? (
            <span style={{ color: "red" }}>{error}</span>
          ) : helperText ? (
            helperText
          ) : (
            <p>&nbsp;</p>
          )
        }
      />
    );
  };

  onSubmit = async formProps => {
    const { createParticipant, successSnackbar, errorSnackbar } = this.props;
    const { fullname, email } = formProps;
    const { courses: _courses } = this.state;

    const courses = _.chain(_courses)
      .pickBy(course => course)
      .keys()
      .value();

    try {
      this.setState({ submitStatus: SUBMITTING });
      await createParticipant({ fullname, email, courses });
      this.onClose();
      successSnackbar(`Participant created`);
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

  handleCheckboxChange = course => () => {
    this.setState({
      courses: {
        ...this.state.courses,
        [course]: !Boolean(this.state.courses[course])
      }
    });
  };

  render() {
    const { classes, state, name, handleSubmit } = this.props;
    const { submitStatus, courses } = this.state;

    return (
      <Fragment>
        <Dialog open={Boolean(state[name])} aria-labelledby="form-dialog-title">
          <Fragment>
            <form onSubmit={handleSubmit(this.onSubmit)}>
              <DialogTitle id="form-dialog-title">
                Create New Participant
              </DialogTitle>
              <DialogContent>
                <FormControl
                  component="fieldset"
                  className={classes.formControl}
                >
                  <FormGroup>
                    <Field
                      name="fullname"
                      type="text"
                      label="Fullname"
                      component={this.renderField}
                      className={classes.textField}
                      disabled={submitStatus === SUBMITTING}
                      fullWidth
                    />
                    <Field
                      name="email"
                      type="email"
                      label="Email"
                      component={this.renderField}
                      className={classes.textField}
                      disabled={submitStatus === SUBMITTING}
                      fullWidth
                    />
                    <br />
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Courses</FormLabel>
                      <FormGroup>
                        {[
                          "Management",
                          "Accounting",
                          "Hospitality",
                          "Systech",
                          "Law"
                        ].map(course => (
                          <FormControlLabel
                            key={course}
                            control={
                              <Checkbox
                                checked={Boolean(courses[course])}
                                onChange={this.handleCheckboxChange(course)}
                                value={course}
                                color="primary"
                              />
                            }
                            label={course}
                          />
                        ))}
                      </FormGroup>
                    </FormControl>
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
      </Fragment>
    );
  }
}

function validate(values) {
  const { fullname, email } = values;
  const errors = {};

  if (!fullname) errors.fullname = "Please provide an Fullname";

  const emailTest = value =>
    value && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
  if (!email) errors.email = "Please specify an email!";
  else if (!emailTest(values.email)) errors.email = "Invalid email address!";

  return errors;
}

export default compose(
  withStyles(styles),
  connect(
    null,
    { ...participantActions, ...snackbarActions }
  ),
  reduxForm({ validate, form: "CreateParticipant" })
)(CreateParticipantDialog);
