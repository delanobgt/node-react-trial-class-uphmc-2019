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
import LinearProgress from "@material-ui/core/LinearProgress";
import Grid from "@material-ui/core/Grid";

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
  currentPosition: 0
};

class DeleteVoteTokenDialog extends React.Component {
  state = INITIAL_STATE;

  onSubmit = async () => {
    const {
      deleteVoteTokenById,
      state,
      name,
      infoSnackbar,
      onActionPerformed
    } = this.props;

    this.setState({ submitStatus: SUBMITTING });
    const toBeDeleteds = _.chain(state[name])
      .pickBy(tbd => tbd)
      .keys()
      .value();
    const successIds = [],
      failIds = [];
    for (let toBeDeleted of toBeDeleteds) {
      try {
        await deleteVoteTokenById(toBeDeleted);
        successIds.push(toBeDeleted);
      } catch (error) {
        console.log({ error });
        failIds.push(toBeDeleted);
      } finally {
        this.setState(state => ({
          currentPosition: state.currentPosition + 1
        }));
      }
    }
    this.onClose();
    infoSnackbar(`Success: ${successIds.length}, Fail: ${failIds.length}`);

    if (onActionPerformed) {
      onActionPerformed({
        successIds: _.mapKeys(successIds, id => id),
        failIds: _.mapKeys(failIds, id => id)
      });
    }
  };

  onClose = () => {
    const { name, toggleDialog } = this.props;
    toggleDialog(name)(false);
    this.setState(INITIAL_STATE);
  };

  render() {
    const { state, name } = this.props;
    const { submitStatus, currentPosition } = this.state;
    const voteTokenIds = state[name];

    if (!voteTokenIds) return null;

    const toBeDeleteds = _.chain(voteTokenIds)
      .pickBy(tbd => tbd)
      .keys()
      .value();

    return (
      <div>
        <Dialog
          open={Boolean(voteTokenIds)}
          aria-labelledby="form-dialog-title"
        >
          <Fragment>
            <DialogTitle id="form-dialog-title">
              Delete Vote Token Confirmation
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="subtitle1">
                  Delete selected Vote Tokens permanently?
                </Typography>
                {submitStatus === SUBMITTING && (
                  <div>
                    <br />
                    <Grid container>
                      <Grid item xs={10}>
                        <Typography variant="subtitle1">
                          Deleting vote tokens ({currentPosition}/
                          {toBeDeleteds.length})
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="subtitle1" align="right">
                          {Math.floor(
                            (currentPosition / toBeDeleteds.length) * 100
                          )}{" "}
                          %
                        </Typography>
                      </Grid>
                    </Grid>
                    <LinearProgress
                      variant="determinate"
                      value={(currentPosition / toBeDeleteds.length) * 100}
                    />
                  </div>
                )}
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
    { ...voteTokenActions, ...snackbarActions }
  )
)(DeleteVoteTokenDialog);
