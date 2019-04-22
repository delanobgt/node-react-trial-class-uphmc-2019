import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import classNames from "classnames";
import PinInput from "react-pin-input";
import Slide from "react-reveal/Slide";
import Fade from "react-reveal/Fade";

import * as voteTokenActions from "../../../../../actions/voteToken";
import * as snackbarActions from "../../../../../actions/snackbar";

const styles = theme => ({
  textField: {
    margin: "0.5em 0"
  },
  formControl: {},
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    display: "inline-block"
  },
  dialogBackground: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.6)"
  },
  dialogBox: {
    backgroundColor: "black",
    borderRadius: "24px",
    border: "2px solid #CFB539",
    padding: "2em 0.8em",
    paddingBottom: "0.8em",
    overflow: "hidden",
    width: "250px"
  },
  title: {
    color: "white",
    fontSize: "1.2em",
    textAlign: "center"
  },

  circleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1em"
  },
  circle: {
    width: "0.35em",
    height: "0.35em",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: "100%",
    margin: "0 0.2em"
  },
  circleActive: {
    backgroundColor: "white"
  },

  contentBox: {
    display: "flex",
    flexWrap: "nowrap",
    overflowX: "scroll",
    height: "180px"
  },
  contentItem: {
    flex: "0 0 auto"
  }
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = {
  submitStatus: IDLE,
  voteToken: "",
  stepIndex: 0
};

class DeleteCandidateDialog extends React.Component {
  state = INITIAL_STATE;
  pinInput = null;

  onSubmit = async () => {
    const {
      updateVoteTokenByValue,
      successSnackbar,
      errorSnackbar,
      state,
      name,
      history
    } = this.props;
    const candidate = state[name];
    const { voteToken } = this.state;

    if (voteToken.length !== 8)
      return errorSnackbar("Some pin character is missing!");

    try {
      this.setState({ submitStatus: SUBMITTING });
      await updateVoteTokenByValue({
        value: voteToken,
        candidateId: candidate._id
      });
      this.onClose();
      history.push("/thankYou");
      successSnackbar(`Vote saved`);
    } catch (error) {
      console.log({ error });
      errorSnackbar(
        _.get(error, "response.data.error.msg", `Please try again!`)
      );
    } finally {
      this.setState({ submitStatus: IDLE });
    }
  };

  onClose = () => {
    const { name, toggleDialog } = this.props;
    toggleDialog(name)(false);
    this.setState(INITIAL_STATE);
  };

  render() {
    const { state, name, classes } = this.props;
    const { submitStatus, stepIndex } = this.state;
    const candidate = state[name];

    // if (!candidate) return null;

    return (
      Boolean(true || candidate) && (
        <div className={classes.dialogBackground}>
          <div className={classes.dialogBox}>
            <div className={classes.contentBox}>
              <div className={classes.contentItem}>
                <Slide left collapse when={stepIndex === 0}>
                  <p className={classes.title}>
                    Input the 6 alphanumeric <br />
                    code from your ticket
                  </p>

                  {/* <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end"
              }}
            >
              <Button
                size="small"
                color="primary"
                onClick={() => this.pinInput.clear()}
              >
                Clear
              </Button>
            </div> */}

                  <div style={{ margin: "0.8em 0" }}>
                    <PinInput
                      length={6}
                      initialValue=""
                      secret
                      focus
                      onChange={(value, index) => {
                        this.setState({ voteToken: value });
                      }}
                      type="custom"
                      style={{ padding: "10px" }}
                      inputStyle={{
                        margin: "0.25em",
                        border: "1px solid black",
                        borderRadius: "5px",
                        backgroundColor: "white",
                        height: "40px",
                        width: "30px",
                        fontSize: "1em"
                      }}
                      inputFocusStyle={{
                        border: "3px solid #CFB539"
                      }}
                      ref={n => (this.pinInput = n)}
                    />
                  </div>
                </Slide>
              </div>

              <div className={classes.contentItem}>
                <Slide right collapse when={stepIndex === 1}>
                  <p className={classes.title}>
                    Input the 6 alphanumeric <br />
                    code from your ticket
                  </p>

                  {/* <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end"
              }}
            >
              <Button
                size="small"
                color="primary"
                onClick={() => this.pinInput.clear()}
              >
                Clear
              </Button>
            </div> */}

                  <div style={{ margin: "0.8em 0" }}>
                    <PinInput
                      length={6}
                      initialValue=""
                      secret
                      focus
                      onChange={(value, index) => {
                        this.setState({ voteToken: value });
                      }}
                      type="custom"
                      style={{ padding: "10px" }}
                      inputStyle={{
                        margin: "0.25em",
                        border: "1px solid black",
                        borderRadius: "5px",
                        backgroundColor: "white",
                        height: "40px",
                        width: "30px",
                        fontSize: "1em"
                      }}
                      inputFocusStyle={{
                        border: "3px solid #CFB539"
                      }}
                      ref={n => (this.pinInput = n)}
                    />
                  </div>
                </Slide>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                className="btn btn-grad-4"
                onClick={
                  stepIndex === 0
                    ? () =>
                        this.setState(state => ({
                          stepIndex: state.stepIndex + 1
                        }))
                    : () =>
                        this.setState(state => ({
                          stepIndex: state.stepIndex - 1
                        }))
                  // :this.onSubmit
                }
                disabled={submitStatus === SUBMITTING}
              >
                {submitStatus === SUBMITTING ? (
                  <CircularProgress size={24} />
                ) : (
                  "NEXT"
                )}
              </button>
            </div>

            <div className={classes.circleContainer}>
              {_.range(2).map(index => (
                <div
                  key={index}
                  className={classNames(classes.circle, {
                    [classes.circleActive]: index === stepIndex
                  })}
                />
              ))}
            </div>
          </div>
        </div>
      )
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    null,
    { ...voteTokenActions, ...snackbarActions }
  ),
  withRouter
)(DeleteCandidateDialog);
