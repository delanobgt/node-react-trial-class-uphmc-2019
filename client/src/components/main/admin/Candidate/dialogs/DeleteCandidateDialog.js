import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import * as candidateActions from "../../../../../actions/candidate";
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
  submitStatus: IDLE
};

class DeleteCandidateDialog extends React.Component {
  state = INITIAL_STATE;

  onSubmit = async () => {
    const {
      deleteCandidateById,
      successSnackbar,
      errorSnackbar,
      state,
      name
    } = this.props;
    const candidate = state[name];

    try {
      this.setState({ submitStatus: SUBMITTING });
      await deleteCandidateById(candidate._id);
      this.onClose();
      successSnackbar(`Candidate deleted`);
    } catch (error) {
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
            <DialogTitle id="form-dialog-title">
              Delete Candidate Confirmation
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="subtitle1">
                  Delete candidate{" "}
                  <span style={{ color: "blue" }}>{candidate.fullname}</span>{" "}
                  permanently?
                </Typography>
              </DialogContentText>
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
    { ...candidateActions, ...snackbarActions }
  )
)(DeleteCandidateDialog);
