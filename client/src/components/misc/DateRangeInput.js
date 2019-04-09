import moment from "moment";
import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import * as snackbarActions from "../../actions/snackbar";

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center"
  },
  dateField: {
    marginRight: "1em"
  }
});

class DateRangeInput extends Component {
  constructor(props) {
    super(props);
    if (props.initDate) {
      const { startDate, endDate } = props.initDate;
      this.state = {
        startDate,
        endDate
      };
    } else {
      this.state = {
        startDate: moment().format("YYYY-MM-DD"),
        endDate: moment().format("YYYY-MM-DD")
      };
    }
  }

  handleChange = stateName => event => {
    this.setState({ [stateName]: event.target.value });
  };

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
    const { classes, buttonLabel, actionButtonDisabled } = this.props;

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div className={classes.container}>
            <TextField
              type="date"
              label="Start Date"
              required={true}
              disabled={actionButtonDisabled === true}
              onChange={this.handleChange("startDate")}
              value={this.state.startDate}
              className={classes.dateField}
            />
            <TextField
              type="date"
              label="End Date"
              required={true}
              disabled={actionButtonDisabled === true}
              onChange={this.handleChange("endDate")}
              value={this.state.endDate}
              className={classes.dateField}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={actionButtonDisabled === true}
            >
              {buttonLabel || "Generate"}
            </Button>
          </div>
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
)(DateRangeInput);
