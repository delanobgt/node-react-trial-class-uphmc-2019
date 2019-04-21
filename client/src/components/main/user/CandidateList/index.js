import "react-table/react-table.css";
import "./css/gradient-button.css";
import "./css/splash.css";
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
import { ArrowRightAlt as ArrowRightAltIcon } from "@material-ui/icons";

import * as candidateActions from "../../../../actions/candidate";
import ConfirmDialog from "./dialogs/ConfirmDialog";
import Hexagon from "./svg/Hexagon";
import Lotus from "./svg/Lotus";

const styles = theme => ({
  retryText: {
    textAlign: "center"
  },
  retryButton: {
    display: "block",
    margin: "auto",
    textAlign: "center"
  },
  paper: {
    padding: "2em"
  },
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    display: "inline-block"
  },

  splashItem: {
    scrollSnapAlign: "start",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: "100%",
    scrollSnapAlign: "start",
    flex: "0 0 auto"
  },

  circularProgress: {
    circleIndeterminate: {
      color: "#cfb539",
      backgroundColor: "#cfb539"
    }
  },

  cardWrapper: {
    display: "flex",
    alignItems: "center",
    flexWrap: "nowrap",
    overflowX: "scroll",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#1b1a17",
    "&::-webkit-scrollbar": {
      display: "none"
    },
    "scroll-snap-type": "mandatory" /* Firefox */,
    "scroll-snap-type": "x mandatory" /* Chrome Canary */,
    "-ms-scroll-snap-type": "mandatory" /* IE/Edge */,
    "-webkit-scroll-snap-type": "mandatory" /* Safari */,
    "scroll-snap-points-x": "repeat(100vw)",
    "-webkit-scroll-snap-destination": "0% 0%",
    "-webkit-overflow-scrolling": "touch" /* important for iOS */
  },
  card: {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    width: "100%",
    padding: "1em",
    "scroll-snap-align": "center" /* latest (Chrome 69+) */,
    "scroll-snap-coordinate": "50% 50%" /* older (Firefox/IE) */,
    "-webkit-scroll-snap-coordinate": "50% 50%" /* older (Safari) */
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
    width: "1.5em",
    height: "1.5em",
    margin: "0 0.5em",
    fontSize: "1.25em",
    padding: "2px"
  },
  shortBar: {
    width: "28px",
    height: "1px",
    backgroundColor: "#CFB539"
  },

  imageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  fullnameParagraph: {
    fontSize: "1.5em",
    color: "white"
  },
  longBar: {
    width: "100px",
    height: "1px",
    backgroundColor: "#CFB539",
    margin: "0.25em 0"
  },
  majorParagraph: {
    fontSize: "1em",
    color: "white"
  },

  voteButton: {
    border: "3px solid #896528",
    backgroundColor: "#D5AF34",
    borderRadius: "9px",
    padding: "0.35em",
    color: "white",
    marginTop: "1em"
  }
});

const LOADING = "LOADING",
  ERROR = "ERROR",
  DONE = "DONE";

const animationClassNames = ["splash-logo-1", "splash-logo-2", "splash-logo-3"];

const paragraphClassNames = [
  "splash-paragraph-1",
  "splash-paragraph-1",
  "splash-paragraph-2"
];

class CandidateListIndex extends React.Component {
  state = {
    loadingStatus: LOADING,
    animationStatus: 0
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

  startAnimation = () => {
    setTimeout(() => {
      this.setState(state => ({ animationStatus: state.animationStatus + 1 }));
      setTimeout(() => {
        this.setState(state => ({
          animationStatus: state.animationStatus + 1
        }));
      }, 2000);
    }, 1000);
  };

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {}

  render() {
    const { classes, candidates } = this.props;
    const { loadingStatus, animationStatus } = this.state;

    let splashContent = null;
    let mainContent = null;

    splashContent = (
      <Grid item xs={12} className={classes.splashItem}>
        <img
          src={require("../../../../res/images/logo.png")}
          alt=""
          onLoad={this.startAnimation}
          className={classNames(
            "splash-logo",
            animationClassNames[animationStatus]
          )}
        />
        <p
          className={classNames(
            "splash-paragraph",
            paragraphClassNames[animationStatus]
          )}
        >
          Vote for your favourite candidate!
        </p>

        <div
          className={classNames(
            "splash-loading",
            animationStatus >= 2 && loadingStatus === LOADING
              ? "splash-loading-2"
              : "splash-loading-1"
          )}
        >
          <CircularProgress size={32} classes={classes.circularProgress} />
        </div>

        <div
          className={classNames(
            "splash-direction",
            animationStatus >= 2 && loadingStatus === DONE
              ? "splash-direction-2"
              : "splash-direction-1"
          )}
        >
          <p>Swipe to see candidates </p>
          <ArrowRightAltIcon style={{ color: "#cfb539" }} />
        </div>
      </Grid>
    );

    if (loadingStatus === DONE && animationStatus >= 2) {
      const data = _.chain(candidates)
        .values()
        .sortBy([cand => cand.orderNumber])
        .map(cand => ({
          ...cand,
          orderNumber:
            cand.orderNumber < 10 ? "0" + cand.orderNumber : cand.orderNumber
        }))
        .value();

      mainContent = data.map(d => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          key={d.orderNumber}
          className={classes.card}
        >
          <div className={classes.orderNumberPart}>
            <div className={classes.shortBar} />
            <div className={classes.orderNumber}>{d.orderNumber}</div>
            <div className={classes.shortBar} />
          </div>

          <div className={classes.imageWrapper}>
            <Lotus size={50} />
            <Hexagon
              key={d.orderNumber}
              id={d.orderNumber}
              style={{ margin: "0 1.5em" }}
              size={145}
              imgUrl={_.get(
                d,
                "image.secureUrl",
                "https://via.placeholder.com/300"
              )}
            />
            <Lotus size={50} />
          </div>

          <div>
            <Lotus size={20} style={{ margin: "0.5em 0" }} />
          </div>

          <p className={classes.fullnameParagraph}>{d.fullname}</p>
          <div className={classes.longBar} />
          <p className={classes.majorParagraph}>{d.major}</p>

          {/* <button
            className={classes.voteButton}
            onClick={() => this.toggleDialog("ConfirmDialog")(d)}
          >
            VOTE
          </button> */}

          <button
            className="btn btn-grad-4"
            onClick={() => this.toggleDialog("ConfirmDialog")(d)}
          >
            VOTE
          </button>
        </Grid>
      ));
    }

    return (
      <Fragment>
        <Grid container className={classes.cardWrapper}>
          {splashContent}
          {mainContent}
        </Grid>
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
