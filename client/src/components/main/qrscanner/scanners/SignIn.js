import React, { Component, Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import QrReader from "react-qr-reader";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
// import Button from "@material-ui/core/Button";
// import { KeyboardBackspace as KeyboardBackspaceIcon } from "@material-ui/icons";

import * as participantActions from "../../../../actions/participant";
// import CleanLink from "../../../misc/CleanLink";
import CardToastDialog from "./dialogs/CardToastDialog";

const styles = theme => ({
  root: {
    display: "flex"
  },
  formControl: {
    margin: theme.spacing.unit * 3
  },
  group: {
    margin: `${theme.spacing.unit}px 0`
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
  }
});

const SUBMITTING = "SUBMITTING",
  SUBMITTED = "SUBMITTED",
  IDLE = "IDLE";

class QRScannerSignIn extends Component {
  state = {
    delay: 500,
    facingMode: "environment",
    submitStatus: IDLE
  };

  handleScan = async scanResult => {
    const { submitStatus } = this.state;
    const { signInParticipantById } = this.props;
    if (scanResult && submitStatus === IDLE) {
      console.log({ scanResult });
      this.setState({
        submitStatus: SUBMITTING
      });
      try {
        const { participant } = await signInParticipantById(scanResult);
        this.toggleDialog("CardToastDialog")({
          actionType: "signIn",
          participant
        });
        this.setState({
          submitStatus: SUBMITTED
        });
      } catch (error) {
        console.log({ error });
        this.toggleDialog("CardToastDialog")({ actionType: "error", error });
      }
    }
  };

  toggleDialog = stateName => open =>
    this.setState(state => ({
      [stateName]: open === undefined ? !Boolean(state[stateName]) : open
    }));

  handleError = error => {
    console.log({ error });
  };

  handleRadioChange = e => {
    this.setState({ facingMode: e.target.value });
  };

  render() {
    const { classes } = this.props;
    const { submitStatus } = this.state;

    // const BackButton = () => (
    //   <CleanLink to="/qrscanner/menu">
    //     <Button variant="outlined" color="primary" size="small">
    //       <KeyboardBackspaceIcon style={{ marginRight: "0.35em" }} />
    //       back to scanner type menu
    //     </Button>
    //   </CleanLink>
    // );

    return (
      <Fragment>
        {submitStatus === SUBMITTING && (
          <div className={classes.spinner}>
            <CircularProgress size={48} />
          </div>
        )}
        <Grid container justify="center">
          <Grid item xs={11} sm={6} md={4} lg={3}>
            <br />

            <Typography variant="h3" align="center" style={{ color: "blue" }}>
              Sign In
            </Typography>
            <br />

            <QrReader
              delay={this.state.delay}
              onScan={this.handleScan}
              onError={this.handleError}
              facingMode={this.state.facingMode}
              style={{ width: "100%" }}
            />
            <Typography variant="subtitle1">
              Please use Google Chrome for Android and Safari for iOS
            </Typography>

            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Rear / Front</FormLabel>
              <RadioGroup
                aria-label="Rear / Front"
                value={this.state.facingMode}
                onChange={this.handleRadioChange}
              >
                <FormControlLabel
                  value="environment"
                  control={<Radio />}
                  label="Rear"
                />
                <FormControlLabel
                  value="user"
                  control={<Radio />}
                  label="Front"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        {Boolean(this.state["CardToastDialog"]) && (
          <CardToastDialog
            name="CardToastDialog"
            state={this.state}
            toggleDialog={this.toggleDialog}
            idleBackScanner={() => this.setState({ submitStatus: IDLE })}
          />
        )}
      </Fragment>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    null,
    { ...participantActions }
  )
)(QRScannerSignIn);
