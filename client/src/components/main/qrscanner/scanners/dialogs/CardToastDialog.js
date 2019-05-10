import _ from "lodash";
import React, { Fragment } from "react";
import { withRouter } from "react-router-dom";
import { withStyles, Typography } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import LinearProgress from "@material-ui/core/LinearProgress";
import {
  CheckCircleOutlined as CheckCircleIcon,
  CancelOutlined as CancelIcon
} from "@material-ui/icons";

const styles = theme => ({});

const INITIAL_STATE = {
  progressBarValue: 0,
  timerInterval: null
};

class CardToastDialog extends React.Component {
  state = INITIAL_STATE;

  onClose = () => {
    const { name, toggleDialog, idleBackScanner } = this.props;
    idleBackScanner();
    toggleDialog(name)(false);
  };

  componentDidMount() {
    const { state, name } = this.props;
    const payload = state[name];
    if (payload.actionType !== "error") {
      const timerInterval = setInterval(() => {
        this.setState(state => {
          if (state.progressBarValue === 100) {
            this.onClose();
            return {};
          } else {
            return {
              progressBarValue: state.progressBarValue + 10
            };
          }
        });
      }, 500);
      this.setState({ timerInterval });
    }
  }

  componentWillUnmount() {
    const { timerInterval } = this.state;
    if (timerInterval) clearInterval(timerInterval);
  }

  render() {
    const { progressBarValue } = this.state;
    const { state, name } = this.props;
    const payload = state[name];

    if (!payload) return null;
    const { actionType, participant, error } = payload;

    const actionTypeDict = {
      signIn: "SIGNED IN",
      signOut: "SIGNED OUT",
      error: "OPS!"
    };

    const iconDict = {
      signIn: (
        <CheckCircleIcon
          style={{
            color: "MediumBlue",
            fontSize: "4em"
          }}
        />
      ),
      signOut: (
        <CheckCircleIcon
          style={{
            color: "SeaGreen",
            fontSize: "4em"
          }}
        />
      ),
      error: (
        <CancelIcon
          style={{
            color:
              error &&
              _.get(error, "response.data.error.type", null) === "WARNING"
                ? "white"
                : "DarkRed",
            fontSize: "4em"
          }}
        />
      )
    };

    const bgColorDict = {
      signIn: "CornflowerBlue",
      signOut: "MediumAquamarine",
      error:
        error && _.get(error, "response.data.error.type", null) === "WARNING"
          ? "orange"
          : "Crimson"
    };

    const todayCourse = _.get(error, "response.data.error.todayCourse", null);

    return (
      <Dialog open={Boolean(payload)} aria-labelledby="form-dialog-title">
        <DialogContent
          onClick={this.onClose}
          style={{ background: bgColorDict[actionType] }}
        >
          <div style={{ textAlign: "center" }}>{iconDict[actionType]}</div>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            style={{ color: "white" }}
          >
            {actionTypeDict[actionType]}
          </Typography>
          {actionType === "error" ? (
            <Fragment>
              <Typography
                variant="subtitle1"
                align="center"
                gutterBottom
                style={{ color: "white" }}
              >
                {_.get(error, "response.data.error.msg", "Please try again!")}
              </Typography>

              {todayCourse && (
                <Typography
                  variant="subtitle"
                  align="center"
                  gutterBottom
                  style={{ color: "white" }}
                >
                  ({todayCourse} day)
                </Typography>
              )}
            </Fragment>
          ) : (
            <Fragment>
              <Typography
                variant="subtitle1"
                align="center"
                gutterBottom
                style={{ color: "white" }}
              >
                as
              </Typography>
              <Typography
                variant="h6"
                align="center"
                gutterBottom
                style={{ color: "white" }}
              >
                {participant ? participant.fullname : ""}
              </Typography>

              <Typography
                variant="subtitle"
                align="center"
                gutterBottom
                style={{ color: "white" }}
              >
                ({participant.todayCourse} day)
              </Typography>
            </Fragment>
          )}
          <br />
          <br />
          <Typography
            variant="subtitle1"
            align="center"
            gutterBottom
            style={{ color: "white" }}
          >
            TAP TO DISMISS
          </Typography>
          {actionType !== "error" && (
            <Fragment>
              <LinearProgress variant="determinate" value={progressBarValue} />
              <Typography
                variant="body2"
                align="center"
                gutterBottom
                style={{ color: "white" }}
              >
                (will autoclose in {5 - Math.floor(progressBarValue / 20)}{" "}
                seconds)
              </Typography>
            </Fragment>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(styles)(withRouter(CardToastDialog));
