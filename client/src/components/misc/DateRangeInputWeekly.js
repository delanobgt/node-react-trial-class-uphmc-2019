import moment from "moment";
import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import * as snackbarActions from "../../actions/snackbar";

const styles = theme => ({
  button: {
    marginTop: theme.spacing.unit * 3.5,
    marginBottom: theme.spacing.unit * 2
  },
  dateField: {
    margin: "0.5em 0.5em",
    display: "inline-block"
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center"
  },
  wrapper: {
    padding: "1em"
  }
});

class DateRangeInputWeekly extends Component {
  state = {
    startDate: "",
    endDate: ""
  };

  handleStartDateChange = event => {
    const startMoment = moment(event.target.value);
    while (startMoment.format("dddd") !== "Monday")
      startMoment.subtract(1, "days");
    this.setState({ startDate: startMoment.format("YYYY-MM-DD") });
  };

  handleEndDateChange = event => {
    const endMoment = moment(event.target.value);
    while (endMoment.format("dddd") !== "Sunday") endMoment.add(1, "days");
    this.setState({ endDate: endMoment.format("YYYY-MM-DD") });
  };

  componentDidMount() {
    this.handleStartDateChange({
      target: { value: moment().format("YYYY-MM-DD") }
    });
    this.handleEndDateChange({
      target: { value: moment().format("YYYY-MM-DD") }
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { startDate, endDate } = this.state;
    const { errorSnackbar, onAction } = this.props;
    if (moment(startDate).isAfter(endDate)) {
      return errorSnackbar("Invalid data range!");
    }
    if (onAction) onAction({ startDate, endDate });
  };

  render() {
    const { classes, actionButtonDisabled } = this.props;

    return (
      <div className={classes.wrapper}>
        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={32} className={classes.container}>
            <TextField
              type="date"
              label="Start Date"
              required={true}
              onChange={this.handleStartDateChange}
              value={this.state.startDate}
              className={classes.dateField}
              autoComplete="off"
            />
            <TextField
              type="date"
              label="End Date"
              required={true}
              onChange={this.handleEndDateChange}
              value={this.state.endDate}
              className={classes.dateField}
              autoComplete="off"
            />
            <div className={classes.wrapper}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
                disabled={
                  actionButtonDisabled !== undefined &&
                  Boolean(actionButtonDisabled)
                }
              >
                Generate
              </Button>
            </div>
          </Grid>
        </form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...snackbarActions }
  )
)(DateRangeInputWeekly);
