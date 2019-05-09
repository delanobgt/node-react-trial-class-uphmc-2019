import _ from "lodash";
import React, { Component, Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import blue from "@material-ui/core/colors/blue";

import * as authActions from "../../../../actions/auth";
import * as snackbarActions from "../../../../actions/snackbar";
import SignInWallpaper from "../../../../res/images/sign_in_wallpaper.jpg";

const styles = theme => ({
  button: {
    marginTop: theme.spacing.unit * 2.5,
    marginBottom: theme.spacing.unit * 2
  },
  paper: {
    padding: theme.spacing.unit * 3,
    maxHeight: "auto"
  },
  buttonProgress: {
    color: blue[500]
  },
  wallpaper: {
    height: "100vh",
    background: "orange",
    backgroundImage: `url(${SignInWallpaper})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat"
  }
});

const SUBMITTED = "SUBMITTED",
  SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

class ForgetPassword extends Component {
  state = {
    submitStatus: IDLE
  };

  onSubmit = async formValues => {
    const {
      sendForgetUserPasswordEmail,
      errorSnackbar,
      successSnackbar
    } = this.props;
    try {
      this.setState({ submitStatus: SUBMITTING });
      await sendForgetUserPasswordEmail(_.pick(formValues, ["email"]));
      this.setState({ submitStatus: SUBMITTED });
      successSnackbar("Email sent.");
    } catch (error) {
      this.setState({ submitStatus: IDLE });
      errorSnackbar(
        _.get(error, "response.data.error.msg", `Please try again!`)
      );
    }
  };

  renderField = field => {
    const { touched, error } = field.meta;
    return (
      <div>
        <TextField
          {...field}
          {...field.input}
          fullWidth
          autoComplete="off"
          helperText={
            touched ? (
              <div style={{ color: "red" }}>{error}</div>
            ) : (
              <p>&nbsp;</p>
            )
          }
        />
      </div>
    );
  };

  render() {
    const { submitStatus } = this.state;
    const { classes, handleSubmit, history } = this.props;

    return (
      <Fragment>
        <Grid
          container
          justify="center"
          alignItems="center"
          className={classes.wallpaper}
        >
          <Grid item xs={10} sm={6} md={4} lg={3}>
            <Paper elevation={6} className={classes.paper}>
              <Typography variant="h5" align="center">
                Forget password
              </Typography>
              {[IDLE, SUBMITTING].includes(submitStatus) ? (
                <Fragment>
                  <Typography
                    variant="body1"
                    align="center"
                    style={{ margin: "1em 0" }}
                  >
                    Please provide the email address of your account.
                  </Typography>
                  <form onSubmit={handleSubmit(this.onSubmit)}>
                    <FormControl style={{ width: "100%" }}>
                      <FormGroup>
                        <Field
                          type="email"
                          name="email"
                          label="Email"
                          component={this.renderField}
                          disabled={submitStatus === SUBMITTING}
                        />
                      </FormGroup>
                    </FormControl>
                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      fullWidth={true}
                      className={classes.button}
                      disabled={submitStatus === SUBMITTING}
                    >
                      {submitStatus === SUBMITTING ? (
                        <CircularProgress
                          size={24}
                          className={classes.buttonProgress}
                        />
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                </Fragment>
              ) : (
                <Fragment>
                  <Typography
                    variant="body1"
                    align="center"
                    style={{ margin: "1em 0" }}
                  >
                    Please check your email. We have sent you further
                    instructions.
                  </Typography>
                </Fragment>
              )}
              <Typography variant="subtitle1" align="center">
                <Button
                  color="primary"
                  fullWidth
                  onClick={() => history.push("/signIn")}
                  disabled={submitStatus === SUBMITTING}
                >
                  Back
                </Button>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

function validate(values) {
  const errors = {};

  const emailTest = value =>
    value && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
  if (!values.email) errors.email = "Please specify an email!";
  else if (!emailTest(values.email)) errors.email = "Invalid email address!";

  return errors;
}

export default compose(
  withStyles(styles),
  reduxForm({ validate, form: "ForgetPassword" }),
  connect(
    null,
    { ...authActions, ...snackbarActions }
  )
)(ForgetPassword);
