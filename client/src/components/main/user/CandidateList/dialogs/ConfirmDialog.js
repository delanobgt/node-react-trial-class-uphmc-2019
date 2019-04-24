import "../css/dialog.css";
import _ from "lodash";
import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import classNames from "classnames";
import PinInput from "react-pin-input";

import * as voteTokenActions from "../../../../../actions/voteToken";
import * as snackbarActions from "../../../../../actions/snackbar";

const styles = theme => ({
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
    padding: "2em 0.6em",
    paddingBottom: "0.8em",
    width: "80vw",
    maxWidth: "300px"
  },
  scrollBox: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    flexWrap: "nowrap",
    overflowX: "scroll",
    "&::-webkit-scrollbar": {
      display: "none"
    }
  },
  contentBox: {
    flex: "0 0 auto",
    width: "100%",
    overflow: "hidden",
    height: "230px"
  },
  title: {
    color: "white",
    fontSize: "0.8em",
    textAlign: "center",
    letterSpacing: "0.1em",
    wordSpacing: "0.15em",
    lineHeight: "1.7em"
  },
  secondTitle: {
    color: "white",
    fontSize: "0.8em",
    textAlign: "center",
    letterSpacing: "0.1em",
    wordSpacing: "0.15em",
    lineHeight: "1.7em",
    marginBottom: "0.4em"
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

  captcha: {
    marginTop: "0.7em",
    borderRadius: "12px",
    width: "150px"
  },
  textField: {
    border: 0,
    borderRadius: "7px",
    padding: "0.35em",
    textAlign: "center",
    fontSize: "1em",
    width: "100px",
    textTransform: "uppercase"
  },
  tokenValueErrorMsg: {
    textAlign: "center",
    color: "red",
    marginTop: "0.4em",
    marginBottom: "0.65em"
  },
  captchaValueErrorMsg: {
    textAlign: "center",
    color: "red",
    marginTop: "0.3em"
  }
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

function getNewCaptchaUrl() {
  return (
    `${process.env.REACT_APP_API_BASE_URL ||
      window.location.origin}/api/voteTokens/captcha?` + new Date().getTime()
  );
}

const INITIAL_STATE = {
  submitStatus: IDLE,
  tokenValue: "",
  stepIndex: 0,
  captchaUrl: getNewCaptchaUrl(),
  captchaValue: "",
  tokenValueError: <span>&nbsp;</span>,
  captchaValueError: <span>&nbsp;</span>
};

class ConfirmDialog extends React.Component {
  state = INITIAL_STATE;
  pinInput = null;

  componentDidMount() {
    if (this.pinInput) this.pinInput.focus();
  }

  handleFirstSubmit = async () => {
    const { tokenValue } = this.state;

    if (tokenValue.length !== 6) {
      this.setState({ tokenValueError: "Please input missing code" });
    } else {
      this.setState(state => ({
        stepIndex: state.stepIndex + 1,
        tokenValueError: <span>&nbsp;</span>
      }));
    }
  };

  handleSecondSubmit = async () => {
    const { updateVoteTokenByValue, state, name, history } = this.props;
    const candidate = state[name];
    const { tokenValue, captchaValue } = this.state;

    try {
      if (!captchaValue) {
        return this.setState({
          captchaValueError: "Please type the letters!"
        });
      }
      this.setState({
        submitStatus: SUBMITTING,
        captchaValueError: <span>&nbsp;</span>
      });
      await updateVoteTokenByValue({
        tokenValue: tokenValue.toUpperCase().replace(/ /g, ""),
        captchaValue: captchaValue.toUpperCase().replace(/ /g, ""),
        candidateId: candidate._id
      });
      this.onClose();
      history.push("/thankYou");
    } catch (error) {
      console.log({ error });
      this.setState({
        captchaValue: "",
        captchaValueError: _.get(
          error,
          "response.data.error.msg",
          "Please try again!"
        )
      });
      if (_.get(error, "response.data.error.expired", false)) {
        console.log("getNewCaptchaUrl");
        this.setState({ captchaUrl: getNewCaptchaUrl() });
      }
    } finally {
      this.setState({ submitStatus: IDLE });
    }
  };

  onClose = () => {
    const { name, toggleDialog } = this.props;
    toggleDialog(name)(false);
    this.setState(INITIAL_STATE);
  };

  handleCaptchaValueChange = e => {
    this.setState({
      captchaValue: _.get(e, "target.value", this.state.captchaValue)
    });
  };

  handleCaptchaLoad = () => {
    console.log("loaded");
  };
  handleCaptchaLoadStart = () => {
    console.log("load starting..");
  };

  render() {
    const { state, name, classes } = this.props;
    const {
      submitStatus,
      stepIndex,
      captchaUrl,
      captchaValue,
      tokenValueError,
      captchaValueError
    } = this.state;
    const candidate = state[name];

    if (!candidate) return null;

    return (
      Boolean(candidate) && (
        <div className={classes.dialogBackground}>
          <div
            className={classNames(
              classes.dialogBox,
              candidate ? "box-2" : "box-1"
            )}
          >
            <Grid container className={classes.scrollBox}>
              <Grid
                item
                xs={12}
                className={classNames(
                  classes.contentBox,
                  stepIndex === 0 ? "first-item-1" : "first-item-2"
                )}
              >
                <div>
                  <p className={classes.title}>
                    INPUT THE 6 ALPHANUMERIC <br />
                    TOKEN FROM YOUR TICKET
                  </p>

                  <div
                    style={{
                      marginTop: "1.2em",
                      display: "flex",
                      justifyContent: "center"
                    }}
                  >
                    <PinInput
                      length={6}
                      initialValue=""
                      focus
                      onChange={(value, index) => {
                        this.setState({ tokenValue: value });
                      }}
                      type="custom"
                      style={{ padding: "10px" }}
                      inputStyle={{
                        textTransform: "uppercase",
                        margin: "0.2em",
                        border: "1px solid black",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        height: "36px",
                        width: "28px",
                        fontSize: "1em"
                      }}
                      inputFocusStyle={{
                        border: "3px solid #CFB539"
                      }}
                      ref={n => (this.pinInput = n)}
                    />
                  </div>

                  {tokenValueError && (
                    <p className={classes.tokenValueErrorMsg}>
                      {tokenValueError}
                    </p>
                  )}
                </div>

                <div style={{ textAlign: "center", marginTop: "1em" }}>
                  <button
                    className={classNames("btn", "btn-grad-4", {
                      "btn-disabled": submitStatus === SUBMITTING
                    })}
                    style={{ width: "6em", fontFamily: "Perpetua" }}
                    onClick={this.onClose}
                  >
                    CANCEL
                  </button>
                  <button
                    className={classNames("btn", "btn-grad-4", {
                      "btn-disabled": submitStatus === SUBMITTING
                    })}
                    style={{
                      width: "6em",
                      marginLeft: "1.5em",
                      fontFamily: "Perpetua"
                    }}
                    onClick={this.handleFirstSubmit}
                    disabled={submitStatus === SUBMITTING}
                  >
                    NEXT
                  </button>
                </div>
              </Grid>

              <Grid
                item
                xs={12}
                className={classNames(
                  classes.contentBox,
                  stepIndex === 1 ? "second-item-1" : "second-item-2"
                )}
              >
                <div>
                  <p className={classes.secondTitle}>
                    TYPE THE CAPTCHA TEXT BELOW
                  </p>

                  <div style={{ textAlign: "center" }}>
                    <img
                      alt=""
                      className={classes.captcha}
                      src={captchaUrl}
                      onLoad={this.handleCaptchaLoad}
                      onLoadStart={this.handleCaptchaLoadStart}
                      onLoadStartCapture={this.handleCaptchaLoadStart}
                    />
                  </div>

                  <div style={{ textAlign: "center", margin: "0.8em 0" }}>
                    <input
                      type="text"
                      placeholder="Type here"
                      value={captchaValue}
                      onChange={this.handleCaptchaValueChange}
                      className={classes.textField}
                      autoComplete="off"
                      disabled={submitStatus === SUBMITTING}
                      autoFocus
                      required
                    />
                  </div>
                  {captchaValueError && (
                    <p className={classes.captchaValueErrorMsg}>
                      {captchaValueError}
                    </p>
                  )}
                </div>

                <div style={{ textAlign: "center", marginTop: "0.8em" }}>
                  <button
                    className={classNames("btn", "btn-grad-4", {
                      "btn-disabled": submitStatus === SUBMITTING
                    })}
                    style={{ width: "6em", fontFamily: "Perpetua" }}
                    onClick={() => this.setState({ stepIndex: 0 })}
                    disabled={submitStatus === SUBMITTING}
                  >
                    BACK
                  </button>
                  <button
                    className={classNames("btn", "btn-grad-4", {
                      "btn-disabled": submitStatus === SUBMITTING
                    })}
                    style={{
                      width: "6em",
                      marginLeft: "1.5em",
                      fontFamily: "Perpetua"
                    }}
                    onClick={this.handleSecondSubmit}
                    disabled={submitStatus === SUBMITTING}
                  >
                    {submitStatus === SUBMITTING ? (
                      <CircularProgress size={14} />
                    ) : (
                      "SUBMIT"
                    )}
                  </button>
                </div>
              </Grid>
            </Grid>

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
)(ConfirmDialog);
