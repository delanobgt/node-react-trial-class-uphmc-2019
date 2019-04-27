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
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";
import { withStyles } from "@material-ui/core/styles";

import hasRole from "../../../hoc/hasRole";
import * as candidateActions from "../../../../actions/candidate";
import * as voteTokenActions from "../../../../actions/voteToken";
import requireAuth from "../../../hoc/requireAuth";
import DeleteVoteTokenDialog from "./dialogs/DeleteVoteTokenDialog";
import ReplaceVoteTokenDialog from "./dialogs/ReplaceVoteTokenDialog";

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
  paper: {
    padding: "2em"
  },
  actionDiv: {
    display: "flex",
    justifyContent: "space-between",
    margin: "0.5em 0"
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

const IDLE = "IDLE",
  FOUND = "FOUND",
  FINDING = "FINDING",
  FIND_ERROR = "FIND_ERROR";

class CandidateListIndex extends React.Component {
  state = {
    tokenValue: "",
    token: null,
    loadingStatus: LOADING,
    findingStatus: IDLE,
    findError: null
  };

  handleTokenValueChange = async e => {
    const tokenValue = e.target.value
      ? e.target.value.toUpperCase()
      : e.target.value;

    if (tokenValue && tokenValue.replace(/ /g, "").length === 6) {
      const { getVoteTokenByValue } = this.props;
      try {
        this.setState({ tokenValue, findingStatus: FINDING });
        const { voteToken: token } = await getVoteTokenByValue(tokenValue);
        if (tokenValue !== this.state.tokenValue) return;
        this.setState({ token, findingStatus: FOUND });
      } catch (error) {
        this.setState({
          findingStatus: FIND_ERROR,
          findError: _.get(
            error,
            "response.data.error.msg",
            "Please try again!"
          )
        });
      }
    } else {
      this.setState({ tokenValue });
    }
  };

  fetchData = async () => {
    const { getCandidates } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      await Promise.all([getCandidates()]);
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
    const {
      loadingStatus,
      findingStatus,
      findError,
      tokenValue,
      token
    } = this.state;

    let mainContent = null;
    if (findingStatus === FIND_ERROR) {
      mainContent = (
        <Typography variant="subtitle1" align="center" style={{ color: "red" }}>
          {findError}
        </Typography>
      );
    } else if (findingStatus === FINDING) {
      mainContent = (
        <div style={{ textAlign: "center" }}>
          <CircularProgress size={50} />
        </div>
      );
    } else if (findingStatus === IDLE) {
      mainContent = (
        <Typography variant="subtitle1" align="center">
          Input the token in the textfield above
        </Typography>
      );
    } else if (token !== null) {
      const candidate = _.find(
        candidates,
        cand => cand._id === token.candidateId
      );
      mainContent = (
        <Fragment>
          <Typography variant="h6" gutterBottom>
            Token found
          </Typography>
          <Typography variant="subtitle1">
            <strong>Value Hash:</strong> {token.valueHash}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Candidate Name:</strong>{" "}
            {!candidate
              ? "[EMPTY]"
              : `${candidate.fullname} (${candidate.orderNumber})`}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Used at:</strong>{" "}
            {token.usedAt
              ? moment(token.usedAt).format("D MMMM YYYY (HH:mm:ss)")
              : "[EMPTY]"}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Status:</strong>{" "}
            <Chip
              label={token.candidateId ? "USED" : "UN-USED"}
              color={token.candidateId ? "secondary" : "primary"}
            />
          </Typography>
          <Typography variant="subtitle1">
            <strong>Created At:</strong>{" "}
            {token.createdAt
              ? moment(token.createdAt).format("D MMMM YYYY (HH:mm:ss)")
              : "[EMPTY]"}
          </Typography>
          <div style={{ marginTop: "1em" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.toggleDialog("ReplaceVoteTokenDialog")(token)}
            >
              Replace
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this.toggleDialog("DeleteVoteTokenDialog")(token)}
              style={{ marginLeft: "1em" }}
            >
              Delete
            </Button>
          </div>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            {loadingStatus === ERROR ? (
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
            ) : loadingStatus === LOADING ? (
              <div style={{ textAlign: "center" }}>
                <CircularProgress size={50} />
              </div>
            ) : (
              <Fragment>
                <Paper className={classes.paper} elevation={3}>
                  <Typography variant="h6" className={classes.retryText}>
                    Search Token
                  </Typography>
                  <TextField
                    label="Token"
                    value={tokenValue}
                    onChange={this.handleTokenValueChange}
                    margin="normal"
                    variant="outlined"
                    fullWidth
                  />
                </Paper>
                <Paper
                  className={classes.paper}
                  style={{ marginTop: "1em" }}
                  elevation={3}
                >
                  {mainContent}
                </Paper>
              </Fragment>
            )}
          </Grid>
        </Grid>

        <DeleteVoteTokenDialog
          name="DeleteVoteTokenDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <ReplaceVoteTokenDialog
          name="ReplaceVoteTokenDialog"
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
  hasRole("SUPER_ADMIN"),
  requireAuth,
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...candidateActions, ...voteTokenActions }
  )
)(CandidateListIndex);
