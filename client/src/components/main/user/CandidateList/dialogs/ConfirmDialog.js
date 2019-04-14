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
import PinInput from "react-pin-input";

import * as voteTokenActions from "../../../../../actions/voteToken";
import * as snackbarActions from "../../../../../actions/snackbar";

const styles = theme => ({
  textField: {
    margin: "0.5em 0"
  },
  formControl: {}
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = {
  submitStatus: IDLE,
  voteToken: ""
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
    const { state, name } = this.props;
    const { submitStatus } = this.state;
    const candidate = state[name];

    if (!candidate) return null;

    return (
      <div>
        <Dialog open={Boolean(candidate)} aria-labelledby="form-dialog-title">
          <Fragment>
            <DialogTitle id="form-dialog-title">Vote Confirmation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="subtitle1">
                  Vote for {candidate.fullname}?
                </Typography>
              </DialogContentText>
              <PinInput
                length={8}
                initialValue=""
                secret
                focus
                onChange={(value, index) => {
                  this.setState({ voteToken: value });
                }}
                type="custom"
                style={{ padding: "10px" }}
                inputStyle={{
                  border: "2px solid black",
                  height: "70px",
                  width: "40px"
                }}
                inputFocusStyle={{ border: "2px solid lightblue" }}
                ref={n => (this.pinInput = n)}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.onClose}
                color="primary"
                disabled={submitStatus === SUBMITTING}
              >
                No
              </Button>
              <Button
                onClick={this.onSubmit}
                color="secondary"
                disabled={submitStatus === SUBMITTING}
              >
                {submitStatus === SUBMITTING ? (
                  <CircularProgress size={24} />
                ) : (
                  "Yes"
                )}
              </Button>
            </DialogActions>
          </Fragment>
        </Dialog>
      </div>
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
