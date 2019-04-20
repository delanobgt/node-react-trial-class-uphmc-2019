import "react-table/react-table.css";
import "./css/gradient-button.css";
import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

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
    }
  },
  card: {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    width: "100%",
    padding: "1em"
    // border: "1px solid yellow"
  },

  orderNumberPart: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5em"
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
    padding: "0.5em",
    color: "white",
    marginTop: "1em"
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
            className="btn btn-1"
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
