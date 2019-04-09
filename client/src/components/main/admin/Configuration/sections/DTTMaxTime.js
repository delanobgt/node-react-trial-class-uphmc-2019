import _ from "lodash";
import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

import * as configurationActions from "../../../../../actions/configuration";
import * as snackbarActions from "../../../../../actions/snackbar";

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const styles = theme => ({
  paper: {
    padding: "1.75em"
  }
});

class DTTMaxTime extends React.Component {
  state = {
    submitStatus: IDLE
  };

  renderField = field => {
    const { error, touched } = field.meta;
    return (
      <TextField
        {...field.input}
        {...field}
        autoComplete="off"
        helperText={
          touched ? (
            <span style={{ color: "red" }}>{error}</span>
          ) : (
            <p>&nbsp;</p>
          )
        }
      />
    );
  };

  onSubmit = async formProps => {
    const { updateConfiguration, errorSnackbar, successSnackbar } = this.props;
    try {
      this.setState({ submitStatus: SUBMITTING });
      await updateConfiguration(_.pick(formProps, "dosenTidakTetapMaxTime"));
      successSnackbar("Dosen Tidak Tetap Max Time updated.");
    } catch (error) {
      console.log({ error });
      errorSnackbar(
        _.get(error, "response.data.error.msg", `Please try again!`)
      );
    } finally {
      this.setState({ submitStatus: IDLE });
    }
  };

  render() {
    const { submitStatus } = this.state;
    const { handleSubmit, classes, pristine } = this.props;

    return (
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="subtitle1">Dosen Tidak Tetap Max Time</Typography>
        <br />
        <div>
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <Field
              type="text"
              name="dosenTidakTetapMaxTime"
              label="HH:MM"
              component={this.renderField}
              disabled={submitStatus === SUBMITTING}
              InputLabelProps={{
                shrink: true
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end"
              }}
            >
              <Button
                color="primary"
                variant="outlined"
                style={{ marginRight: "1em" }}
                disabled={pristine || submitStatus === SUBMITTING}
                onClick={() => this.props.reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={pristine || submitStatus === SUBMITTING}
              >
                {submitStatus === IDLE ? (
                  "Save"
                ) : (
                  <CircularProgress size={18} />
                )}
              </Button>
            </div>
          </form>
        </div>
      </Paper>
    );
  }
}

function validate(values) {
  const errors = {};
  const { dosenTidakTetapMaxTime } = values;

  const timeTest = value =>
    value && /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
  if (!dosenTidakTetapMaxTime)
    errors.dosenTidakTetapMaxTime = "Please provide a time!";
  else if (!timeTest(values.dosenTidakTetapMaxTime))
    errors.dosenTidakTetapMaxTime = "Time should be in HH:MM format!";

  return errors;
}

function mapStateToProps(state) {
  return {
    initialValues: _.pick(state.configuration, "dosenTidakTetapMaxTime")
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...configurationActions, ...snackbarActions }
  ),
  reduxForm({
    validate,
    form: "DTTMaxTime",
    enableReinitialize: true
  })
)(DTTMaxTime);
