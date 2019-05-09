import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import { compose } from "redux";

import Snackbar from "./misc/Snackbar";

import SignIn from "./main/Auth/SignIn";
import SignOut from "./main/Auth/SignOut";
import ForgetPassword from "./main/Auth/ForgetPassword";
import ResetPassword from "./main/Auth/ResetPassword";

import Nav from "./main/Nav";
import Profile from "./main/Profile";
import DyingDialog from "./main/Auth/DyingDialog";
import TokenExpirationWatch from "./main/Auth/TokenExpirationWatch";
import Socket from "./main/Socket";

import Dashboard from "./main/Dashboard";
import Participant from "./main/Participant";
import User from "./main/User";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Fragment>
          <Snackbar />

          <Switch>
            <Route
              path="/resetPassword/users/:userId/email/:email/token/:token"
              component={ResetPassword}
            />

            {!this.props.token ? (
              <Fragment>
                <Switch>
                  <Route path="/signIn" component={SignIn} />
                  <Route path="/forgetPassword" component={ForgetPassword} />
                  <Route path="*" component={() => <Redirect to="/signIn" />} />
                </Switch>
              </Fragment>
            ) : (
              <Fragment>
                <DyingDialog />
                <TokenExpirationWatch />
                <Socket />
                <Nav />
                <Switch>
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/participants" component={Participant} />
                  <Route path="/users" component={User} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/signOut" component={SignOut} />
                  <Route
                    path="*"
                    component={() => <Redirect to="/dashboard" />}
                  />
                </Switch>
                <br />
                <br />
              </Fragment>
            )}
          </Switch>
        </Fragment>
      </BrowserRouter>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  };
}

export default compose(connect(mapStateToProps))(App);
