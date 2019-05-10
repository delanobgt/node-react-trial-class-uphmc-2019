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
  formControl: { minWidth: "300px" }
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = {
  submitStatus: IDLE,
  courses: {}
};

class EditParticipantDialog extends React.Component {
  state = INITIAL_STATE;

  componentDidMount() {
    const { state, name } = this.props;
    const payload = state[name];
    this.setState({
      courses: _.chain(payload.courses)
        .mapKeys(course => course)
        .mapValues(() => true)
        .value()
    });
  }

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
    const {
      updateParticipantById,
      successSnackbar,
      errorSnackbar,
      state,
      name
    } = this.props;
    const payload = state[name];
    const { fullname, email } = formProps;
    const { courses: _courses } = this.state;

    const courses = _.chain(_courses)
      .pickBy(course => course)
      .keys()
      .value();

    try {
      this.setState({ submitStatus: SUBMITTING });
      await updateParticipantById(payload._id, { fullname, email, courses });
      this.onClose();
      successSnackbar(`Participant updated`);
    } catch (error) {
      console.log({ error });
      errorSnackbar(
        _.get(error, "response.data.error.msg", `Please try again!`)
      );
    } finally {
      this.setState({ submitStatus: IDLE });
    }
  };

  handleCheckboxChange = course => () => {
    this.setState({
      courses: {
        ...this.state.courses,
        [course]: !Boolean(this.state.courses[course])
      }
    });
  };

  onClose = () => {
    const { name, toggleDialog, reset } = this.props;
    toggleDialog(name)(false);
    this.setState(INITIAL_STATE);
    reset();
  };

  render() {
    const { classes, state, name, handleSubmit } = this.props;
    const { submitStatus, courses } = this.state;

    const payload = state[name];
    if (!payload) return null;

    return (
      <Fragment>
        <Dialog open={Boolean(payload)} aria-labelledby="form-dialog-title">
          <Fragment>
            <form onSubmit={handleSubmit(this.onSubmit)}>
              <DialogTitle id="form-dialog-title">Edit Participant</DialogTitle>
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
                    "Save"
                  )}
                </Button>
              </DialogActions>
            </form>
          </Fragment>
        </Dialog>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          style={{ display: "none" }}
          ref="upload"
          onChange={this.handleFileChange}
        />
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

function mapStateToProps(storeState, props) {
  const { state, name } = props;
  const payload = state[name];
  if (!payload) return {};
  return {
    initialValues: {
      fullname: payload.fullname,
      email: payload.email
    }
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...participantActions, ...snackbarActions }
  ),
  reduxForm({ validate, form: "EditParticipant", enableReinitialize: true })
)(EditParticipantDialog);
