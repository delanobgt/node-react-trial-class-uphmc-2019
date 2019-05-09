import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "@material-ui/core/styles";

import moment from "moment";
import MomentUtils from "@date-io/moment";
import MuiPickersUtilsProvider from "material-ui-pickers/MuiPickersUtilsProvider";
import DateTimePicker from "material-ui-pickers/DateTimePicker";

import requireAuth from "../../hoc/requireAuth";
import * as configurationActions from "../../../actions/configuration";
import * as snackbarActions from "../../../actions/snackbar";

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
    managementMoment: moment(),
    accountingMoment: moment(),
    hospitalityMoment: moment(),
    systechMoment: moment(),
    lawMoment: moment(),
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
    const {
      managementMoment,
      accountingMoment,
      hospitalityMoment,
      systechMoment,
      lawMoment
    } = this.props;
    this.setState({
      managementMoment,
      accountingMoment,
      hospitalityMoment,
      systechMoment,
      lawMoment
    });
  };

  fetchData = async () => {
    const { getConfiguration } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      const {
        configuration: {
          managementDate,
          accountingDate,
          hospitalityDate,
          systechDate,
          lawDate
        }
      } = await getConfiguration();
      this.setState({
        loadingStatus: DONE,
        managementMoment: moment(managementDate),
        accountingMoment: moment(accountingDate),
        hospitalityMoment: moment(hospitalityDate),
        systechMoment: moment(systechDate),
        lawMoment: moment(lawDate)
      });
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  handleSubmit = async () => {
    const { updateConfiguration, errorSnackbar, successSnackbar } = this.props;
    const {
      managementMoment,
      accountingMoment,
      hospitalityMoment,
      systechMoment,
      lawMoment
    } = this.state;
    try {
      this.setState({ submitStatus: SUBMITTING });
      await updateConfiguration({
        managementDate: managementMoment.toDate(),
        accountingDate: accountingMoment.toDate(),
        hospitalityDate: hospitalityMoment.toDate(),
        systechDate: systechMoment.toDate(),
        lawDate: lawMoment.toDate()
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
      this.state.managementMoment.format() !==
        this.props.managementMoment.format() ||
      this.state.accountingMoment.format() !==
        this.props.accountingMoment.format() ||
      this.state.hospitalityMoment.format() !==
        this.props.hospitalityMoment.format() ||
      this.state.systechMoment.format() !== this.props.systechMoment.format() ||
      this.state.lawMoment.format() !== this.props.lawMoment.format()
    );
  };

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { classes } = this.props;
    const {
      managementMoment,
      accountingMoment,
      hospitalityMoment,
      systechMoment,
      lawMoment,
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
                        Management Date
                      </Typography>
                      <DateTimePicker
                        value={managementMoment}
                        onChange={this.handleDatetimeChange("managementMoment")}
                      />
                    </div>

                    <div style={{ marginTop: "1.5em" }}>
                      <Typography variant="h6" gutterBottom>
                        Accounting Date
                      </Typography>
                      <DateTimePicker
                        value={accountingMoment}
                        onChange={this.handleDatetimeChange("accountingMoment")}
                      />
                    </div>

                    <div style={{ marginTop: "1.5em" }}>
                      <Typography variant="h6" gutterBottom>
                        Hospitality Date
                      </Typography>
                      <DateTimePicker
                        value={hospitalityMoment}
                        onChange={this.handleDatetimeChange(
                          "hospitalityMoment"
                        )}
                      />
                    </div>

                    <div style={{ marginTop: "1.5em" }}>
                      <Typography variant="h6" gutterBottom>
                        Systech Date
                      </Typography>
                      <DateTimePicker
                        value={systechMoment}
                        onChange={this.handleDatetimeChange("systechMoment")}
                      />
                    </div>

                    <div style={{ marginTop: "1.5em" }}>
                      <Typography variant="h6" gutterBottom>
                        Law Date
                      </Typography>
                      <DateTimePicker
                        value={lawMoment}
                        onChange={this.handleDatetimeChange("lawMoment")}
                      />
                    </div>
                  </MuiPickersUtilsProvider>

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
