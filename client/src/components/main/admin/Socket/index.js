import io from "socket.io-client";
import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import * as authActions from "../../../../actions/auth";
import * as userActions from "../../../../actions/user";
import * as snackbarActions from "../../../../actions/snackbar";
import requireAuth from "../../../hoc/requireAuth";
import StickyLoading from "./small-components/StickyLoading";

class SocketIndex extends React.Component {
  state = { msg: null, socket: null };

  componentDidMount() {
    const { auth, updateSelfConnected } = this.props;
    const socket = io.connect(
      `${process.env.REACT_APP_API_BASE_URL ||
        window.location.origin}/globalSocket`,
      {
        query: `userId=${auth.id}`
      }
    );
    this.setState({ socket });

    // socket connection events
    socket.on("connect", () => {
      this.setState({ msg: "Connected" });
      setTimeout(() => this.setState({ msg: null }), 2000);
    });
    socket.on("connecting", () => {
      this.setState({ msg: "Connecting.." });
      updateSelfConnected(false);
    });
    socket.on("connect_failed", () => {
      this.setState({ msg: "Failed!" });
      updateSelfConnected(false);
    });
    socket.on("reconnect", () => {
      this.setState({ msg: "Reconnected" });
      updateSelfConnected(false);
      setTimeout(() => this.setState({ msg: null }), 2000);
    });
    socket.on("reconnecting", () => {
      updateSelfConnected(false);
      this.setState({ msg: "Reconnecting.." });
    });
    socket.on("reconnect_failed", () => {
      updateSelfConnected(false);
      this.setState({ msg: "Failed!" });
    });
    socket.on("disconnect", () => {
      updateSelfConnected(false);
      this.setState({ msg: "Disconnected!" });
    });
    socket.on("error", () => {
      updateSelfConnected(false);
      this.setState({ msg: "Error!" });
    });

    // auth store update
    const { getSelfProfile } = this.props;
    socket.on("SELF_PROFILE_GET", payload => {
      if (auth.id === payload.id) getSelfProfile();
    });

    // user store update
    const { getUserById, removeUserById } = this.props;
    socket.on("USER_GET_BY_ID", payload => {
      getUserById(payload.id);
    });
    socket.on("USER_REMOVE_BY_ID", payload => {
      removeUserById(payload.id);
    });
  }

  componentWillUnmount() {
    console.log("socket willUnmount");
    const { socket } = this.state;
    if (socket) socket.close();
  }

  render() {
    const { msg } = this.state;
    return msg ? <StickyLoading msg={msg} /> : null;
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  };
}

export default compose(
  connect(
    mapStateToProps,
    {
      ...authActions,
      ...userActions,
      ...snackbarActions
    }
  ),
  requireAuth
)(SocketIndex);
