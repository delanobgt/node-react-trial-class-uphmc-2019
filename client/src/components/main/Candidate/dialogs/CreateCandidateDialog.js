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
import * as snackbarActions from "../../../../../actions/snackbar";
import { compose } from "redux";

const styles = theme => ({
  formControl: { minWidth: "280px" },
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
  imageFile: null,
  imageUrl: null,
  progressBarOffset: 0,
  progressBarMessage: ""
};

class CreateCandidateDialog extends React.Component {
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
    this.setState({ progressBarOffset: (e.loaded / e.total) * 70 });
  };

  onSubmit = async formProps => {
    const { createCandidate, successSnackbar, errorSnackbar } = this.props;
    const { orderNumber, fullname, major } = formProps;
    const { imageFile } = this.state;

    if (!imageFile) return errorSnackbar("Please choose an image!");

    const socket = io.connect(
      `${process.env.REACT_APP_API_BASE_URL ||
        window.location.origin}/identifiedSockets`
    );
    socket.on("ready", async () => {
      try {
        this.setState({ submitStatus: SUBMITTING });
        await createCandidate({
          data: { orderNumber, fullname, major, imageFile },
          onUploadProgress: this.onUploadProgress,
          socketId: socket.id
        });
        this.onClose();
        successSnackbar(`Candidate created`);
      } catch (error) {
        console.log({ error });
        errorSnackbar(
          _.get(error, "response.data.error.msg", `Please try again!`)
        );
      } finally {
        this.setState({ submitStatus: IDLE, progressBarOffset: 0 });
        socket.close();
      }
    });
    socket.on("progress", ({ msg, currentStep, totalStep }) => {
      this.setState({
        progressBarMessage: msg,
        progressBarOffset: 70 + (currentStep / totalStep) * 30
      });
    });
  };

  handleFileChange = async e => {
    const { errorSnackbar } = this.props;
    const { imageUrl } = this.state;
    const imageFile = _.head(e.target.files);
    if (
      !imageFile.name.endsWith(".png") &&
      !imageFile.name.endsWith(".jpeg") &&
      !imageFile.name.endsWith(".jpg")
    ) {
      this.refs.upload.value = "";
      return errorSnackbar("Only .png, .jpeg, .jpg are allowed!");
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    this.setState({ imageFile, imageUrl: URL.createObjectURL(imageFile) });
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
      imageUrl,
      progressBarMessage,
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
                      name="orderNumber"
                      type="number"
                      label="Order Number"
                      component={this.renderField}
                      className={classes.textField}
                      disabled={submitStatus === SUBMITTING}
                      fullWidth
                    />
                    <Field
                      name="fullname"
                      type="text"
                      label="Fullname"
                      component={this.renderField}
                      className={classes.textField}
                      disabled={submitStatus === SUBMITTING}
                      fullWidth
                    />
                    <Field
                      name="major"
                      type="text"
                      label="Major"
                      component={this.renderField}
                      className={classes.textField}
                      disabled={submitStatus === SUBMITTING}
                      fullWidth
                    />
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        className={classes.picture}
                        style={{
                          backgroundImage: `url(${imageUrl ||
                            "https://via.placeholder.com/300?text=SQUARE"})`
                        }}
                      />
                      <br />
                      <div style={{ marginLeft: "1em" }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          disabled={submitStatus === SUBMITTING}
                          onClick={e => this.refs.upload.click()}
                        >
                          Choose..
                        </Button>
                        <br />
                        <Typography variant="caption">
                          Only .png, .jpeg, .jpg <br /> are allowed!
                        </Typography>
                      </div>
                    </div>
                    {submitStatus === SUBMITTING && (
                      <div>
                        <br />
                        <Grid container>
                          <Grid item xs={10}>
                            <Typography variant="subtitle1">
                              {progressBarMessage}
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
  const { orderNumber, fullname, major } = values;
  const errors = {};

  if (!orderNumber) errors.orderNumber = "Please provide an Order Number";
  else if (isNaN(orderNumber))
    errors.orderNumber = "Please provide a numeric value!";

  if (!fullname) errors.fullname = "Please provide an Fullname";

  if (!major) errors.major = "Please provide a Major";

  return errors;
}

export default compose(
  withStyles(styles),
  connect(
    null,
    { ...candidateActions, ...snackbarActions }
  ),
  reduxForm({ validate, form: "CreateCandidate" })
)(CreateCandidateDialog);
