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
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

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
  newVoteToken: null,
  checked: false
};

class DeleteVoteTokenDialog extends React.Component {
  state = INITIAL_STATE;

  handleCheckedChange = () => {
    this.setState({ checked: !this.state.checked });
  };

  onSubmit = async () => {
    const {
      replaceVoteTokenById,
      successSnackbar,
      errorSnackbar,
      state,
      name
    } = this.props;
    const voteToken = state[name];

    try {
      this.setState({ submitStatus: SUBMITTING });
      const { newVoteToken } = await replaceVoteTokenById(voteToken._id);
      console.log(newVoteToken);
      this.setState({ newVoteToken });
      successSnackbar(`Vote Token replaced`);
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
    const { submitStatus, checked, newVoteToken } = this.state;
    const voteToken = state[name];

    if (!voteToken) return null;

    return (
      <div>
        <Dialog open={Boolean(voteToken)} aria-labelledby="form-dialog-title">
          <Fragment>
            <DialogTitle id="form-dialog-title">
              Replace Vote Token Confirmation
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="subtitle1">
                  {newVoteToken ? (
                    <Fragment>
                      New token: <strong>{newVoteToken.value}</strong>
                    </Fragment>
                  ) : (
                    "Replace selected Vote Token permanently?"
                  )}
                </Typography>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              {!newVoteToken ? (
                <Fragment>
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
                </Fragment>
              ) : (
                <Fragment>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={this.handleCheckedChange}
                        value=""
                      />
                    }
                    label="I have copied the new token"
                  />
                  <Button
                    onClick={this.onClose}
                    color="primary"
                    disabled={!checked}
                  >
                    {submitStatus === SUBMITTING ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Done"
                    )}
                  </Button>
                </Fragment>
              )}
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
  )
)(DeleteVoteTokenDialog);
