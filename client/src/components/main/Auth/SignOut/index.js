import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

import * as authActions from "../../../../actions/auth";
import * as snackbarActions from "../../../../actions/snackbar";

class SignOut extends Component {
  async componentDidMount() {
    const { signOut, infoSnackbar, errorSnackbar, history } = this.props;
    try {
      await signOut();
      infoSnackbar("You're logged out");
    } catch (error) {
      errorSnackbar("Unable to logout");
      history.push("/");
    }
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column"
        }}
      >
        <CircularProgress />
        <Typography variant="body2" gutterBottom>
          Logging you out...
        </Typography>
      </div>
    );
  }
}

export default compose(
  connect(
    null,
    { ...authActions, ...snackbarActions }
  )
)(SignOut);
