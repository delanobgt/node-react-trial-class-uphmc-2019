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

class LeaveQuotas extends React.Component {
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
      const leaveQuotas = _.map(formProps, (value, kategoriPegawai) => ({
        kategoriPegawai,
        value: Number(value),
        units: "days"
      }));
      await updateConfiguration({ leaveQuotas });
      successSnackbar("Leave Quotas updated.");
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
    const {
      kategoriPegawaiEnums,
      handleSubmit,
      classes,
      pristine
    } = this.props;

    return (
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="subtitle1">Leave Quotas</Typography>
        <br />
        <div>
          <form onSubmit={handleSubmit(this.onSubmit)}>
            {kategoriPegawaiEnums.map(kp =>
              kp === "Karyawan Tetap Non-Akademik" ? (
                <div key={kp}>
                  <Field
                    type="number"
                    name={kp}
                    label={`${kp} (initial)`}
                    component={this.renderField}
                    disabled
                    required
                    InputLabelProps={{
                      shrink: true
                    }}
                    style={{ width: "300px" }}
                  />
                </div>
              ) : (
                <div key={kp}>
                  <Field
                    type="number"
                    name={kp}
                    label={kp}
                    component={this.renderField}
                    disabled={submitStatus === SUBMITTING}
                    required
                    InputLabelProps={{
                      shrink: true
                    }}
                    style={{ width: "300px" }}
                  />
                </div>
              )
            )}

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

function mapStateToProps(state) {
  const { leaveQuotas } = state.configuration;
  return {
    initialValues: _.chain(leaveQuotas)
      .mapKeys(lq => lq.kategoriPegawai)
      .mapValues(lq => lq.value)
      .value()
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...configurationActions, ...snackbarActions }
  ),
  reduxForm({
    form: "LeaveQuotas",
    enableReinitialize: true
  })
)(LeaveQuotas);
