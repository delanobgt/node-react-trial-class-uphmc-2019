import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import blue from "@material-ui/core/colors/blue";

import * as authActions from "../../../../../actions/auth";
import * as userActions from "../../../../../actions/user";
import * as snackbarActions from "../../../../../actions/snackbar";
import SignInWallpaper from "../../../../../res/images/sign_in_wallpaper.jpg";

const styles = theme => ({
  passwordField: {
    margin: "0.5em 0"
  },
  button: {
    marginTop: theme.spacing.unit * 3,
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

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";
const VERIFYING = "VERIFYING",
  VERIFIED = "VERIFIED",
  INVALID = "INVALID";

const INITIAL_STATE = {
  submitStatus: IDLE,
  tokenStatus: VERIFYING,
  tokenError: ""
};

class ResetPassword extends React.Component {
  state = INITIAL_STATE;

  async componentDidMount() {
    const { signOut } = this.props;
    await signOut();
    this.checkToken();
  }

  checkToken = async () => {
    const { checkResetUserPasswordToken } = this.props;
    const { userId, token } = this.props.match.params;
    try {
      await checkResetUserPasswordToken(userId, { token });
      this.setState({ tokenStatus: VERIFIED });
    } catch (error) {
      console.log({ error });
      this.setState({
        tokenStatus: INVALID,
        tokenError: _.get(
          error,
          "response.data.error.msg",
          "Token is either expired or invalid!"
        )
      });
    }
  };

  onSubmit = async formValues => {
    const {
      updateUserPasswordById,
      signIn,
      history,
      successSnackbar
    } = this.props;
    const { newPassword } = formValues;
    const { userId, email, token } = this.props.match.params;

    try {
      this.setState({ submitStatus: SUBMITTING });
      await updateUserPasswordById(userId, { newPassword, token });
      await signIn({ email, password: newPassword });
      history.push("/");
      successSnackbar("Password saved.");
    } catch (error) {
      this.setState({ submitStatus: IDLE });
      return this.setState({
        tokenStatus: INVALID,
        tokenError: _.get(
          error,
          "response.data.error.msg",
          "Token is either expired or invalid!"
        )
      });
    }
  };

  renderField = field => {
    let { touched, error } = field.meta;
    if (error && Array.isArray(error)) {
      error = error.length
        ? error.map(rule => (
            <li key={rule} style={{ marginLeft: "0.35em" }}>
              {rule}
            </li>
          ))
        : null;
    }
    return (
      <TextField
        {...field}
        {...field.input}
        fullWidth
        autoComplete="off"
        helperText={touched ? <div style={{ color: "red" }}>{error}</div> : ""}
      />
    );
  };

  render() {
    const { classes, handleSubmit } = this.props;
    const { submitStatus, tokenStatus, tokenError } = this.state;

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
                Set Password
              </Typography>
              {tokenStatus === VERIFYING ? (
                <div style={{ textAlign: "center", margin: "1.5em" }}>
                  <CircularProgress
                    size={36}
                    className={classes.buttonProgress}
                  />
                  <Typography variant="body1">Verifying token...</Typography>
                </div>
              ) : tokenStatus === INVALID ? (
                <Typography
                  variant="body1"
                  align="center"
                  style={{ margin: "1em 0" }}
                >
                  {tokenError}
                </Typography>
              ) : (
                <Fragment>
                  <Typography
                    component="p"
                    align="center"
                    style={{ margin: "1em 0" }}
                  >
                    Please provide your new password
                  </Typography>
                  <form onSubmit={handleSubmit(this.onSubmit)}>
                    <FormControl component="fieldset" style={{ width: "100%" }}>
                      <FormGroup>
                        <Field
                          name="newPassword"
                          type="password"
                          label="New Password"
                          component={this.renderField}
                          className={classes.passwordField}
                          disabled={submitStatus === SUBMITTING}
                        />
                        <Field
                          name="confirmNewPassword"
                          type="password"
                          label="Confirm New Password"
                          component={this.renderField}
                          className={classes.passwordField}
                          disabled={submitStatus === SUBMITTING}
                        />
                      </FormGroup>
                    </FormControl>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
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
                        "Set Password"
                      )}
                    </Button>
                  </form>
                </Fragment>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

function validate(values) {
  const errors = {};
  const { newPassword, confirmNewPassword } = values;

  errors.newPassword = _.compact([
    !newPassword || newPassword.length < 8
      ? `Password must be at least 8 (${
          newPassword ? newPassword.length : 0
        }/8)`
      : null,
    !newPassword || newPassword.search(/[a-z]/g) === -1
      ? "Password must contain at least 1 lowercase character"
      : null,
    !newPassword || newPassword.search(/[A-Z]/g) === -1
      ? "Password must contain at least 1 uppercase character"
      : null,
    !newPassword || newPassword.search(/[0-9]/g) === -1
      ? "Password must contain at least 1 digit"
      : null
  ]);
  if (!errors.newPassword.length) delete errors["newPassword"];

  if (!confirmNewPassword)
    errors.confirmNewPassword = "Please rewrite your password!";
  else if (newPassword !== confirmNewPassword)
    errors.confirmNewPassword = "Passwords do not match!";

  return errors;
}

export default compose(
  withStyles(styles),
  reduxForm({ validate, form: "ResetPassword" }),
  connect(
    null,
    { ...authActions, ...userActions, ...snackbarActions }
  )
)(ResetPassword);
