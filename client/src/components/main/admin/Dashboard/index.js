import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "@material-ui/core/styles";

import moment from "moment";
import MomentUtils from "@date-io/moment";
import MuiPickersUtilsProvider from "material-ui-pickers/MuiPickersUtilsProvider";
import DateTimePicker from "material-ui-pickers/DateTimePicker";

import requireAuth from "../../../hoc/requireAuth";
import * as configurationActions from "../../../../actions/configuration";
import * as snackbarActions from "../../../../actions/snackbar";

const LOADING = "LOADING",
  DONE = "DONE",
  ERROR = "ERROR";

const IDLE = "IDLE",
  SUBMITTING = "SUBMITTING";

const styles = theme => ({
  actionDiv: {
    display: "flex",
    justifyContent: "flex-end"
  }
});
class Welcome extends Component {
  state = {
    openMoment: moment(),
    closeMoment: moment(),
    onAir: false,
    loadingStatus: LOADING,
    submitStatus: IDLE
  };

  handleDatetimeChange = name => moment => {
    this.setState({ [name]: moment });
  };

  handleOnAirChange = () => {
    this.setState({ onAir: !this.state.onAir });
  };

  handleReset = () => {
    const { openMoment, closeMoment, onAir } = this.props;
    this.setState({
      openMoment,
      closeMoment,
      onAir
    });
  };

  fetchData = async () => {
    const { getConfiguration } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      const {
        configuration: { openTimestamp, closeTimestamp, onAir }
      } = await getConfiguration();
      this.setState({
        loadingStatus: DONE,
        openMoment: moment(openTimestamp),
        closeMoment: moment(closeTimestamp),
        onAir
      });
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  handleSubmit = async () => {
    const { updateConfiguration, errorSnackbar, successSnackbar } = this.props;
    const { openMoment, closeMoment, onAir } = this.state;
    try {
      this.setState({ submitStatus: SUBMITTING });
      if (openMoment.valueOf() > closeMoment.valueOf()) {
        return errorSnackbar("Invalid date range!");
      }
      await updateConfiguration({
        openTimestamp: openMoment.toDate(),
        closeTimestamp: closeMoment.toDate(),
        onAir
      });
      successSnackbar("Changes saved");
    } catch (error) {
      console.log({ error });
      errorSnackbar("Please try again");
    } finally {
      this.setState({
        submitStatus: IDLE
      });
    }
  };

  hasDataChanged = () => {
    return (
      this.state.openMoment.format() !== this.props.openMoment.format() ||
      this.state.closeMoment.format() !== this.props.closeMoment.format() ||
      this.state.onAir !== this.props.onAir
    );
  };

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { classes } = this.props;
    const {
      openMoment,
      closeMoment,
      onAir,
      loadingStatus,
      submitStatus
    } = this.state;

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper elevation={3} style={{ padding: "2em" }}>
              <Typography variant="h4" gutterBottom>
                Dashboard
              </Typography>

              {loadingStatus === LOADING ? (
                <div style={{ textAlign: "center" }}>
                  <CircularProgress size={36} />
                </div>
              ) : loadingStatus === ERROR ? (
                <div style={{ textAlign: "center" }}>
                  <Typography variant="subtitle1" align="center">
                    Failed to fetch data!
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={this.fetchData}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div>
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <div style={{ marginTop: "1.5em" }}>
                      <Typography variant="h6" gutterBottom>
                        Open Date & Time
                      </Typography>
                      <DateTimePicker
                        value={openMoment}
                        onChange={this.handleDatetimeChange("openMoment")}
                      />
                    </div>

                    <div style={{ marginTop: "1.5em" }}>
                      <Typography variant="h6" gutterBottom>
                        Close Date & Time
                      </Typography>
                      <DateTimePicker
                        value={closeMoment}
                        onChange={this.handleDatetimeChange("closeMoment")}
                      />
                    </div>
                  </MuiPickersUtilsProvider>

                  <div style={{ marginTop: "1.5em" }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={onAir}
                          onChange={this.handleOnAirChange}
                          value="On Air"
                        />
                      }
                      label="On Air"
                    />
                  </div>

                  {this.hasDataChanged() && (
                    <div className={classes.actionDiv}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={this.handleReset}
                        disabled={submitStatus === SUBMITTING}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: "1em" }}
                        onClick={this.handleSubmit}
                        disabled={submitStatus === SUBMITTING}
                      >
                        {submitStatus === SUBMITTING ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

function mapStateToProps(storeState) {
  return {
    ...storeState.configuration
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...configurationActions, ...snackbarActions }
  ),
  requireAuth
)(Welcome);
