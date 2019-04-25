import "react-table/react-table.css";
import _ from "lodash";
import classNames from "classnames";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

import * as candidateActions from "../../../../actions/candidate";
import * as voteTokenActions from "../../../../actions/voteToken";
import BackgroundBig from "../../../misc/BackgroundBig";
import Hexagon from "./svg/Hexagon";
import Lotus from "./svg/Lotus";
import TripleLotus from "./svg/TripleLotus";
import QuestionMark from "../../../../res/images/question_mark.png";
import Winner from "../../../../res/images/winner.png";

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
    backgroundSize: "cover",
    display: "inline-block"
  },

  secondRunnerUpParagraph: {
    textAlign: "center",
    fontSize: "4.5em",
    fontWeight: "bold",
    marginBottom: "0.5em",
    background: "-webkit-linear-gradient(#f4e488, #9b3524)",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent"
  },
  firstRunnerUpParagraph: {
    textAlign: "center",
    fontSize: "4.5em",
    fontWeight: "bold",
    marginBottom: "0.5em",
    background: "-webkit-linear-gradient(#dde0e3, #6f6e6c)",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent"
  },
  winnerParagraph: {
    textAlign: "center",
    fontSize: "5.5em",
    fontWeight: "bold",
    marginBottom: "0.5em",
    background: "linear-gradient(135deg, #f4d627, #ffffff, #f7f5dd, #f4d627)",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent"
  },

  orderNumberPart: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1em"
  },
  orderNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "100%",
    color: "white",
    border: "1.5px solid #CFB539",
    width: "1.7em",
    height: "1.7em",
    margin: "0 0.5em",
    fontSize: "1.25em",
    padding: "2px"
  },
  shortBar: {
    width: "22px",
    height: "1px",
    backgroundColor: "#CFB539"
  },

  fullnameParagraph: {
    fontSize: "2.8em",
    color: "white"
  },
  longBar: {
    width: "200px",
    height: "1.5px",
    backgroundColor: "#CFB539",
    margin: "1.2em 0"
  },
  majorParagraph: {
    fontSize: "1.25em",
    color: "white"
  },

  dotContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    bottom: 0,
    left: 0,
    color: "gray",
    width: "100vw"
  },
  slash: {
    margin: "0 1em"
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "100%",
    marginLeft: "2px",
    border: "1px solid gray"
  },
  activeDot: {
    background: "gray"
  }
});

const LOADING = "LOADING",
  ERROR = "ERROR",
  IDLE = "IDLE";

function pad2(value) {
  return value <= 9 ? "0" + value : value;
}

class ResultIndex extends React.Component {
  state = {
    loadingStatus: LOADING,
    top3Candidates: [],
    allCandidates: [],
    candidateIndex: 0,
    stepIndex: 0
  };

  alive = false;

  fetchData = async () => {
    const { getCandidates, getVoteTokens } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      const { candidates } = await getCandidates();
      const { voteTokens } = await getVoteTokens();

      const voteTokensPerCandidate = _.groupBy(voteTokens, "candidateId");
      const top3Candidates = _.chain(candidates)
        .sortBy(cand => -(voteTokensPerCandidate[cand._id] || []).length)
        .slice(0, 3)
        .reverse()
        .value();

      this.setState({
        loadingStatus: IDLE,
        top3Candidates,
        allCandidates: _.values(candidates),
        stepIndex: 0
      });
      setTimeout(this.mainLoop, 200);
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  speeds = [1000, 50, 200, 500, 1000];

  mainLoop = () => {
    const {
      candidateIndex,
      allCandidates,
      top3Candidates,
      stepIndex
    } = this.state;

    if (stepIndex % 5 === 0) {
    } else if (stepIndex % 5 === 4) {
      const candidate = allCandidates[candidateIndex];
      if (candidate._id !== top3Candidates[Math.floor(stepIndex / 5)]._id) {
        const newCandidateIndex = (candidateIndex + 1) % allCandidates.length;
        this.setState({ candidateIndex: newCandidateIndex });
      }
    } else {
      const newCandidateIndex = (candidateIndex + 1) % allCandidates.length;
      this.setState({ candidateIndex: newCandidateIndex });
    }

    if (this.alive)
      setTimeout(() => {
        this.mainLoop();
      }, this.speeds[stepIndex % 5]);
  };

  handleKeyDown = event => {
    const { stepIndex } = this.state;
    switch (event.keyCode) {
      case 37: // left arrow key
        if ((stepIndex - 1 + 5) % 5 !== 4)
          this.setState({
            stepIndex: stepIndex - 1
          });
        break;
      case 39: // right arrow key
        if (stepIndex + 1 < 15)
          this.setState({
            stepIndex: stepIndex + 1
          });
        break;
      default:
        break;
    }
  };

  async componentDidMount() {
    this.alive = true;
    await this.fetchData();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    this.alive = false;
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    const { classes } = this.props;
    const {
      loadingStatus,
      candidateIndex,
      allCandidates,
      top3Candidates,
      stepIndex
    } = this.state;
    const candidate = allCandidates[candidateIndex];
    const sectionIndex = Math.floor(stepIndex / 5);

    const infoEnabled =
      stepIndex % 5 === 4 &&
      candidate._id === top3Candidates[Math.floor(stepIndex / 5)]._id;

    const opacities = [0.5, 0.75, 1];

    return (
      <Fragment>
        <BackgroundBig opacity={opacities[sectionIndex]} />

        <div className={classes.dotContainer}>
          {_.range(0, 5).map(index => (
            <div
              className={classNames(classes.dot, {
                [classes.activeDot]: index <= stepIndex
              })}
            />
          ))}
          <span className={classes.slash}>/</span>
          {_.range(5, 10).map(index => (
            <div
              className={classNames(classes.dot, {
                [classes.activeDot]: index <= stepIndex
              })}
            />
          ))}
          <span className={classes.slash}>/</span>
          {_.range(10, 15).map(index => (
            <div
              className={classNames(classes.dot, {
                [classes.activeDot]: index <= stepIndex
              })}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            width: "100vw",
            height: "100vh",
            alignItems: "center"
          }}
        >
          <Grid container justify="center">
            <Grid
              item
              xs={12}
              style={{ textAlign: "center", marginTop: "3em" }}
            >
              <img
                src={require("../../../../res/images/logo.png")}
                alt=""
                style={{ width: "250px" }}
                className={classes.logo}
              />
            </Grid>

            {loadingStatus === ERROR ? (
              <Grid item xs={12}>
                <Typography variant="subtitle1" className={classes.retryText}>
                  Cannot fetch data
                </Typography>
                <Button
                  color="primary"
                  className={classes.retryButton}
                  onClick={this.fetchData}
                >
                  Retry
                </Button>
              </Grid>
            ) : loadingStatus === LOADING ? (
              <Grid item xs={12} style={{ textAlign: "center" }}>
                <CircularProgress size={50} />
              </Grid>
            ) : (
              <Fragment>
                <Grid item xs={12}>
                  <div style={{ marginTop: "1em" }}>
                    {sectionIndex === 0 ? (
                      <p className={classes.secondRunnerUpParagraph}>
                        2<sup>nd</sup> RUNNER UP
                      </p>
                    ) : sectionIndex === 1 ? (
                      <p className={classes.firstRunnerUpParagraph}>
                        1<sup>st</sup> RUNNER UP
                      </p>
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        <img
                          alt=""
                          src={Winner}
                          style={{ width: "30%", marginBottom: "2em" }}
                        />
                      </div>
                    )}
                  </div>
                </Grid>
                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <div style={{ marginRight: "2.5em" }}>
                    <Hexagon
                      id={1}
                      sectionIndex={sectionIndex}
                      size={240}
                      imgUrl={
                        stepIndex % 5 === 0
                          ? QuestionMark
                          : candidate.image.secureUrl
                      }
                    />
                  </div>
                  <div
                    xs={3}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: "2.5em"
                    }}
                  >
                    <div className={classes.orderNumberPart}>
                      <div className={classes.shortBar} />
                      <div className={classes.orderNumber}>
                        {infoEnabled ? pad2(candidate.orderNumber) : ""}
                      </div>
                      <div className={classes.shortBar} />
                    </div>

                    <div>
                      {sectionIndex === 2 ? (
                        <TripleLotus
                          size={50}
                          style={{ marginTop: "0.3em", marginBottom: "0.65em" }}
                        />
                      ) : (
                        <Lotus
                          size={25}
                          style={{ marginTop: "0.3em", marginBottom: "0.65em" }}
                        />
                      )}
                    </div>

                    <p className={classes.fullnameParagraph}>
                      {infoEnabled ? pad2(candidate.fullname) : "-----"}
                    </p>
                    <div className={classes.longBar} />
                    <p className={classes.majorParagraph}>
                      {infoEnabled ? pad2(candidate.major) : "---"}
                    </p>
                  </div>
                </Grid>
              </Fragment>
            )}
          </Grid>
        </div>
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
)(ResultIndex);
