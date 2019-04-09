import _ from "lodash";
import crypto from "crypto";
import io from "socket.io-client";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import Dropzone from "react-dropzone";
import LinearProgress from "@material-ui/core/LinearProgress";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import {
  Done as DoneIcon,
  Clear as ClearIcon,
  CloudUpload as CloudUploadIcon
} from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";

import * as employeeActions from "../../../../actions/employee";
import requireAuth from "../../../hoc/requireAuth";
import ValidationErrorTable from "./ValidationErrorTable";
import UpdateResultTable from "./UpdateResultTable";

// spinner submitStatus
const FATAL_ERROR = "FATAL_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SUBMITTING = "SUBMITTING",
  SUBMITTED = "SUBMITTED",
  IDLE = "IDLE";

const styles = theme => ({
  divider: {
    margin: "1em 0"
  },
  uploadPaper: {
    padding: "3em"
  },
  errorPaper: {
    padding: "3em",
    textAlign: "left",
    background: "lightred"
  },
  filename: {
    margin: "1em"
  },
  dropzoneRoot: {
    background: "rgb(240, 240, 240)",
    padding: "3.5em",
    border: "2px solid lightblue",
    borderRadius: "5px"
  }
});

const INITIAL_STATE = {
  submitStatus: IDLE,
  filename: null,
  progressBarOffset: 0,
  progressBarMessage: "",
  fatalErrorMessage: null,
  errorGrid: {},
  updatedDocuments: []
};

class EmployeeUploadIndex extends React.Component {
  state = INITIAL_STATE;

  resetForm = () => {
    this.setState(INITIAL_STATE);
  };

  onDrop = async acceptedFiles => {
    const { uploadEmployeeExcel } = this.props;
    const excelFile = _.head(acceptedFiles);
    if (!excelFile) {
      return this.setState({
        submitStatus: FATAL_ERROR,
        fatalErrorMessage: "Unsupported file format"
      });
    }

    this.setState({
      submitStatus: SUBMITTING,
      progressBarMessage: "Uploading..",
      progressBarOffset: 0,
      filename:
        excelFile.name.length <= 30
          ? excelFile.name
          : excelFile.name.slice(0, 30) + "..."
    });

    const socketToken = (await crypto.randomBytes(32)).toString("hex");
    const socket = io.connect(
      `${process.env.REACT_APP_HRIS_API_BASE_URL}/tokenizedSockets`,
      {
        query: `socketToken=${socketToken}`
      }
    );
    const SOCKET_PROGRESS_LENGTH = 30;
    const onUploadProgress = e => {
      this.setState({
        progressBarOffset: (e.loaded / e.total) * (100 - SOCKET_PROGRESS_LENGTH)
      });
    };
    socket.on("ready", async () => {
      try {
        const updateResult = await uploadEmployeeExcel({
          onUploadProgress: onUploadProgress,
          excelFile,
          socketToken
        });
        this.setState({
          submitStatus: SUBMITTED,
          updatedDocuments: updateResult.documents
        });
      } catch (error) {
        console.log({ error });
        const errorType = _.get(error, "response.data.error.type", null);
        if (errorType === VALIDATION_ERROR) {
          this.setState({
            submitStatus: VALIDATION_ERROR,
            errorGrid: error.response.data.error.errorGrid
          });
        } else {
          this.setState({
            submitStatus: FATAL_ERROR,
            errorMessage: _.get(
              error,
              "response.data.error.msg",
              "Please try again!"
            )
          });
        }
      } finally {
        socket.close();
      }
    });
    socket.on("progress", ({ msg, currentStep, totalStep }) => {
      this.setState({
        progressBarMessage: msg,
        progressBarOffset:
          100 -
          SOCKET_PROGRESS_LENGTH +
          Math.floor((SOCKET_PROGRESS_LENGTH * (currentStep - 1)) / totalStep)
      });
    });
  };

  render() {
    const { classes } = this.props;
    const {
      submitStatus,
      filename,
      progressBarOffset,
      progressBarMessage,
      fatalErrorMessage,
      errorGrid,
      updatedDocuments
    } = this.state;

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper className={classes.uploadPaper} elevation={3}>
              <Typography variant="h5">Upload Employee Excel</Typography>
              <Divider light className={classes.divider} />
              <Dropzone
                onDrop={this.onDrop}
                accept=".xls, .xlsx"
                disabled={submitStatus !== IDLE}
              >
                {({ getRootProps, getInputProps, open }) => {
                  const rootProps = getRootProps({
                    onClick: event => event.stopPropagation(),
                    onKeyDown: event => {
                      if (event.keyCode === 32 || event.keyCode === 13) {
                        event.stopPropagation();
                      }
                    }
                  });
                  return (
                    <div {...rootProps} className={classes.dropzoneRoot}>
                      <input {...getInputProps()} />

                      <div
                        style={{
                          textAlign: "center",
                          color: "rgb(170, 170, 170)"
                        }}
                      >
                        <CloudUploadIcon style={{ fontSize: "4em" }} />
                      </div>

                      {submitStatus === FATAL_ERROR ? (
                        <div style={{ padding: "0 4em" }}>
                          <Typography
                            variant="subtitle1"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <ClearIcon style={{ color: "red" }} />
                            &nbsp; <strong>{filename}</strong>
                          </Typography>
                          <br />
                          <Typography variant="subtitle1">
                            {fatalErrorMessage ||
                              "Error occured. Please try again."}
                          </Typography>
                          <LinearProgress
                            color="secondary"
                            variant="determinate"
                            value={100}
                          />
                          <br />
                          <div style={{ textAlign: "center" }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={this.resetForm}
                            >
                              Try again
                            </Button>
                          </div>
                        </div>
                      ) : submitStatus === VALIDATION_ERROR ? (
                        <div style={{ padding: "0 4em" }}>
                          <Typography
                            variant="subtitle1"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <ClearIcon style={{ color: "red" }} />
                            &nbsp; <strong>{filename}</strong>
                          </Typography>
                          <br />
                          <Typography variant="subtitle1">
                            There is something wrong with your excel file.
                            Please check below.
                          </Typography>
                          <LinearProgress
                            color="secondary"
                            variant="determinate"
                            value={100}
                          />
                          <br />
                          <div style={{ textAlign: "center" }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={this.resetForm}
                            >
                              Try again
                            </Button>
                          </div>
                        </div>
                      ) : submitStatus === SUBMITTING ? (
                        <div style={{ padding: "0 4em" }}>
                          <Typography
                            variant="subtitle1"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <CircularProgress size={20} /> &nbsp;{" "}
                            <strong>{filename}</strong>
                          </Typography>
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
                      ) : submitStatus === SUBMITTED ? (
                        <div style={{ padding: "0 4em" }}>
                          <Typography
                            variant="subtitle1"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <DoneIcon style={{ color: "limegreen" }} />
                            &nbsp;
                            <strong>{filename}</strong>
                          </Typography>
                          <br />
                          <Grid container>
                            <Grid item xs={6}>
                              <Typography variant="subtitle1">
                                Excel file uploaded
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="subtitle1" align="right">
                                100 %
                              </Typography>
                            </Grid>
                          </Grid>
                          <LinearProgress variant="determinate" value={100} />
                          <br />
                          <div style={{ textAlign: "center" }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={this.resetForm}
                            >
                              Upload again
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Typography
                            variant="h6"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "rgb(170, 170, 170)"
                            }}
                          >
                            Drag and Drop &nbsp;
                            <img
                              alt=""
                              src="https://res.cloudinary.com/psiuphmedan/image/upload/v1553267258/Web%20Assets/excel-png-office-xlsx-icon-3.png"
                              style={{
                                width: "1.2em",
                                marginRight: "0.2em",
                                opacity: 0.75
                              }}
                            />
                            <span style={{ color: "#1F7244", opacity: 0.6 }}>
                              Excel
                            </span>{" "}
                            &nbsp; file here
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            align="center"
                            gutterBottom
                            style={{ color: "rgb(170, 170, 170)" }}
                          >
                            or
                          </Typography>

                          <div style={{ textAlign: "center" }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={open}
                            >
                              Choose file
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              </Dropzone>
            </Paper>
          </Grid>
        </Grid>
        <Grid container justify="center" style={{ marginTop: "2em" }}>
          {submitStatus === VALIDATION_ERROR ? (
            <Grid item xs={11}>
              <ValidationErrorTable errorGrid={errorGrid} />
            </Grid>
          ) : submitStatus === SUBMITTED ? (
            <Grid item xs={11}>
              <UpdateResultTable updatedDocuments={updatedDocuments} />
            </Grid>
          ) : null}
        </Grid>
      </Fragment>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    null,
    { ...employeeActions }
  ),
  requireAuth
)(EmployeeUploadIndex);
