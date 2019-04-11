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
import * as voteTokenActions from "../../../../actions/voteToken";

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
  IDLE = "IDLE",
  REVEALING = "REVEALING",
  REVEALED = "REVEALED";

class CandidateListIndex extends React.Component {
  state = {
    loadingStatus: LOADING,
    winnerCandidate: null,
    randomImageUrl: null,
    winnerImageUrl: null
  };

  fetchData = async () => {
    const { getCandidates, getVoteTokens } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      const { candidates } = await getCandidates();
      const { voteTokens } = await getVoteTokens();

      const voteTokensPerCandidate = _.groupBy(voteTokens, "candidateId");
      const winnerCandidate = _.chain(candidates)
        .maxBy(cand => (voteTokensPerCandidate[cand._id] || []).length)
        .value();

      this.setState({
        loadingStatus: IDLE,
        winnerCandidate,
        winnerImageUrl: winnerCandidate.image.secureUrl
      });
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  randomImage = () => {
    this.setState({ loadingStatus: REVEALING });

    const candidates = _.values(this.props.candidates);

    const recur = (delay, pos) => {
      setTimeout(() => {
        if (this.state.loadingStatus === REVEALED) return;
        this.setState(state => ({
          randomImageUrl: candidates[pos].image.secureUrl
        }));
        recur(delay + 5, (pos + 1) % candidates.length);
      }, delay);
    };
    recur(100, 0);

    setTimeout(() => {
      this.setState({ loadingStatus: REVEALED });
    }, 10000);
  };

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { classes } = this.props;
    const { loadingStatus, randomImageUrl, winnerImageUrl } = this.state;

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
    } else if (loadingStatus === IDLE) {
      mainContent = (
        <div>
          <Button onClick={() => this.randomImage()}>Reveal Winner</Button>
        </div>
      );
    } else if (loadingStatus === REVEALING) {
      mainContent = (
        <div>
          <div
            className={classes.picture}
            style={{
              backgroundImage: `url(${randomImageUrl})`
            }}
          />
        </div>
      );
    } else {
      mainContent = (
        <div>
          <div
            className={classes.picture}
            style={{
              backgroundImage: `url(${winnerImageUrl})`
            }}
          />
        </div>
      );
    }

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" gutterBottom>
                Result
              </Typography>
              <br />
              {mainContent}
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.candidate,
    ...state.voteToken
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...candidateActions, ...voteTokenActions }
  )
)(CandidateListIndex);
