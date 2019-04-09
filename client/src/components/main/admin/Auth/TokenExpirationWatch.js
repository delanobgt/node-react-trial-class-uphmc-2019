import moment from "moment";
import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import * as authActions from "../../../../actions/auth";
import * as snackbarActions from "../../../../actions/snackbar";

class TokenExpirationWatch extends React.Component {
  state = {
    interval: null
  };

  componentDidMount() {
    const interval = setInterval(async () => {
      const { expiresAt, showDyingDialog, getSelfProfile } = this.props;
      const currentTime = moment()
        .toDate()
        .getTime();
      if (expiresAt && currentTime > expiresAt && !showDyingDialog) {
        getSelfProfile();
      }
    }, 3000);
    this.setState({ interval });
  }

  componentWillUnmount() {
    const { interval } = this.state;
    if (interval) clearInterval(interval);
  }

  render() {
    return null;
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  };
}

export default compose(
  connect(
    mapStateToProps,
    { ...authActions, ...snackbarActions }
  )
)(TokenExpirationWatch);
