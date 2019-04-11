import _ from "lodash";
import React, { Fragment } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import QrReader from "react-qr-reader";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";

import * as candidateActions from "../../../../../actions/candidate";
import { compose } from "redux";

const styles = theme => ({
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  },
  spinner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "fixed",
    left: "0",
    top: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "10",
    background: "rgba(255, 255, 255, 0.75)"
  },
  dialog: {
    minWidth: "400px",
    maxWidth: "100vw"
  }
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = {
  submitStatus: IDLE,
  delay: 500,
  facingMode: "environment",
  errorMsg: ""
};

class QRScannerDialog extends React.Component {
  state = INITIAL_STATE;

  state = INITIAL_STATE;

  handleScan = async scanResult => {
    const { submitStatus } = this.state;
    const {
      isVoteTokenAvailableByValue,
      toggleDialog,
      state,
      name
    } = this.props;
    const payload = state[name];

    if (scanResult && submitStatus === IDLE) {
      this.setState({
        submitStatus: SUBMITTING
      });
      try {
        const { available } = await isVoteTokenAvailableByValue(scanResult);
        if (available) {
          toggleDialog("ConfirmDialog")({
            ...payload,
            voteToken: { value: scanResult }
          });
          this.onClose();
        } else {
          this.setState({ errorMsg: "QR Code is invalid!" });
        }
      } catch (error) {
        console.log({ error });
        this.setState({ errorMsg: "Please try again!" });
      } finally {
        this.setState({
          submitStatus: IDLE
        });
      }
    }
  };

  onClose = () => {
    const { name, toggleDialog } = this.props;
    toggleDialog(name)(false);
    this.setState(INITIAL_STATE);
  };

  handleError = error => {
    console.log({ error });
  };

  render() {
    const { classes, state, name } = this.props;
    const { submitStatus, errorMsg } = this.state;

    const payload = state[name];

    if (!payload) return null;

    return (
      <Fragment>
        {submitStatus === SUBMITTING && (
          <div className={classes.spinner}>
            <CircularProgress size={48} />
          </div>
        )}
        <Dialog open={Boolean(payload)} aria-labelledby="form-dialog-title">
          <Fragment>
            <DialogTitle id="form-dialog-title" className={classes.dialog}>
              Please scan your QR Code
            </DialogTitle>
            <DialogContent>
              <QrReader
                delay={this.state.delay}
                onScan={this.handleScan}
                onError={this.handleError}
                facingMode={this.state.facingMode}
                style={{ width: "100%" }}
              />
              <br />
              <Typography variant="subtitle1">
                {errorMsg || <span>&nbsp;</span>}
              </Typography>
              <div>
                <Button color="primary" fullWidth onClick={this.onClose}>
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Fragment>
        </Dialog>
      </Fragment>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    null,
    { ...candidateActions }
  )
)(QRScannerDialog);
