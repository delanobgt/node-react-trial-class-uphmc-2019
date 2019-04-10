import _ from "lodash";
import io from "socket.io-client";
import React, { Fragment } from "react";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";

import * as candidateActions from "../../../../../actions/candidate";
import * as voteTokenActions from "../../../../../actions/voteToken";
import * as snackbarActions from "../../../../../actions/snackbar";
import { compose } from "redux";

const styles = theme => ({
  formControl: { minWidth: "300px" },
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  }
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = {
  submitStatus: IDLE,
  currentStep: 0,
  totalStep: 0,
  progressBarOffset: 0
};

class CreateVoteTokenDialog extends React.Component {
  state = INITIAL_STATE;

  renderField = field => {
    const { helperText } = field;
    const { error, touched } = field.meta;
    return (
      <TextField
        {...field}
        {...field.input}
        autoComplete="off"
        helperText={
          touched && error ? (
            <span style={{ color: "red" }}>{error}</span>
          ) : helperText ? (
            helperText
          ) : (
            <p>&nbsp;</p>
          )
        }
      />
    );
  };

  onUploadProgress = e => {
    this.setState({ progressBarOffset: (e.loaded / e.total) * 0 });
  };

  onSubmit = async formProps => {
    const { createVoteTokens, infoSnackbar, errorSnackbar } = this.props;
    const { voteTokenCount } = formProps;

    const socket = io.connect(
      `${process.env.REACT_APP_API_BASE_URL ||
        window.location.origin}/identifiedSockets`
    );
    socket.on("ready", async () => {
      try {
        this.setState({ submitStatus: SUBMITTING });
        const { voteTokens } = await createVoteTokens({
          voteTokenCount,
          onUploadProgress: this.onUploadProgress,
          socketId: socket.id
        });
        this.onClose();
        infoSnackbar(
          `Success: ${voteTokens.length}, Fail: ${Number(voteTokenCount) -
            voteTokens.length}`
        );
      } catch (error) {
        console.log({ error });
        errorSnackbar(
          _.get(error, "response.data.error.msg", `Please try again!`)
        );
      } finally {
        this.setState({
          submitStatus: IDLE,
          currentStep: 0,
          totalStep: 0,
          progressBarOffset: 0
        });
        socket.close();
      }
    });
    socket.on("progress", ({ msg, currentStep, totalStep }) => {
      this.setState({
        currentStep,
        totalStep,
        progressBarOffset: 0 + (currentStep / totalStep) * 100
      });
    });
  };

  onClose = () => {
    const { name, toggleDialog, reset } = this.props;
    toggleDialog(name)(false);
    this.setState(INITIAL_STATE);
    reset();
  };

  render() {
    const { classes, state, name, handleSubmit } = this.props;
    const {
      submitStatus,
      currentStep,
      totalStep,
      progressBarOffset
    } = this.state;

    return (
      <Fragment>
        <Dialog open={Boolean(state[name])} aria-labelledby="form-dialog-title">
          <Fragment>
            <form onSubmit={handleSubmit(this.onSubmit)}>
              <DialogTitle id="form-dialog-title">Create New User</DialogTitle>
              <DialogContent>
                <FormControl
                  component="fieldset"
                  className={classes.formControl}
                >
                  <FormGroup>
                    <Field
                      name="voteTokenCount"
                      type="number"
                      label="Vote Token Count"
                      component={this.renderField}
                      className={classes.textField}
                      disabled={submitStatus === SUBMITTING}
                      fullWidth
                    />
                    {submitStatus === SUBMITTING && (
                      <div>
                        <br />
                        <Grid container>
                          <Grid item xs={10}>
                            <Typography variant="subtitle1">
                              Creating vote tokens ({currentStep}/{totalStep})
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="subtitle1" align="right">
                              {Math.floor(progressBarOffset)} %
                            </Typography>
                          </Grid>
                        </Grid>
                        <LinearProgress
                          variant="determinate"
                          value={progressBarOffset}
                        />
                      </div>
                    )}
                  </FormGroup>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.onClose}
                  color="primary"
                  disabled={submitStatus === SUBMITTING}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={submitStatus === SUBMITTING}
                >
                  {submitStatus === SUBMITTING ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogActions>
            </form>
          </Fragment>
        </Dialog>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          style={{ display: "none" }}
          ref="upload"
          onChange={this.handleFileChange}
        />
      </Fragment>
    );
  }
}

function validate(values) {
  const { voteTokenCount } = values;
  const errors = {};

  if (!voteTokenCount)
    errors.orderNumber = "Please provide an Vote Token Count";
  else if (isNaN(voteTokenCount))
    errors.orderNumber = "Please provide a numeric value!";

  return errors;
}

export default compose(
  withStyles(styles),
  connect(
    null,
    { ...candidateActions, ...voteTokenActions, ...snackbarActions }
  ),
  reduxForm({ validate, form: "CreateVoteTokens" })
)(CreateVoteTokenDialog);
