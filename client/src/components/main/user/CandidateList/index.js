import "react-table/react-table.css";
import _ from "lodash";
import moment from "moment";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";

import * as candidateActions from "../../../../actions/candidate";
import QRScannerDialog from "./dialogs/QRScannerDialog";
import ConfirmDialog from "./dialogs/ConfirmDialog";

const styles = theme => ({
  retryText: {
    textAlign: "center"
  },
  retryButton: {
    display: "block",
    margin: "auto",
    textAlign: "center"
  },
  headline: {
    marginBottom: "1em"
  },
  excelButton: {
    marginBottom: "1em"
  },
  paper: {
    marginTop: "1em",
    padding: "2em"
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "1.5em 0"
  },
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  }
});

const LOADING = "LOADING",
  ERROR = "ERROR",
  DONE = "DONE";

class CandidateListIndex extends React.Component {
  state = {
    loadingStatus: LOADING
  };

  fetchData = async () => {
    const { getCandidates } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      await getCandidates();
      this.setState({ loadingStatus: DONE });
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  toggleDialog = stateName => open =>
    this.setState(state => ({
      [stateName]: open === undefined ? !Boolean(state[stateName]) : open
    }));

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { classes, candidates } = this.props;
    const { loadingStatus } = this.state;

    let mainContent = null;
    if (loadingStatus === ERROR) {
      mainContent = (
        <Fragment>
          <Typography variant="subtitle1" className={classes.retryText}>
            Cannot fetch data.
          </Typography>
          <Button
            color="primary"
            className={classes.retryButton}
            onClick={this.fetchData}
          >
            Retry
          </Button>
        </Fragment>
      );
    } else if (loadingStatus === LOADING) {
      mainContent = (
        <div style={{ textAlign: "center" }}>
          <CircularProgress size={50} />
        </div>
      );
    } else {
      const data = _.chain(candidates)
        .values()
        .sortBy([cand => cand.orderNumber])
        .value();

      mainContent = (
        <div>
          {data.map(d => (
            <div key={d.orderNumber} className={classes.listItem}>
              <div
                className={classes.picture}
                style={{
                  backgroundImage: `url(${_.get(d, "image.secureUrl", null) ||
                    "https://via.placeholder.com/300"})`
                }}
              />

              <div>
                <Typography variant="subtitle1">
                  Number: {d.orderNumber}
                </Typography>
                <Typography variant="subtitle1">
                  Fullname: {d.fullname}
                </Typography>
                <Typography variant="subtitle1">Major: {d.major}</Typography>
              </div>

              <div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.toggleDialog("QRScannerDialog")(d)}
                >
                  Vote
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" gutterBottom>
                All Candidates
              </Typography>
              <br />
              {mainContent}
            </Paper>
          </Grid>
        </Grid>
        <QRScannerDialog
          name="QRScannerDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <ConfirmDialog
          name="ConfirmDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.candidate
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...candidateActions }
  )
)(CandidateListIndex);
