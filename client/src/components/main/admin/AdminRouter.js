import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Route, Redirect, Switch } from "react-router-dom";
import { compose } from "redux";

import Nav from "./Nav/Loadable";
import Profile from "./Profile/Loadable";

import Dashboard from "./Dashboard/Loadable";

import SignOut from "./Auth/SignOut/Loadable";
import DyingDialog from "./Auth/DyingDialog";
import TokenExpirationWatch from "./Auth/TokenExpirationWatch";
import Socket from "./Socket";

import Candidate from "./Candidate/Loadable";
import VoteToken from "./VoteToken/Loadable";
import Chart from "./Chart/Loadable";
import User from "./User/Loadable";

class App extends Component {
  render() {
    return (
      <Fragment>
        <DyingDialog />
        <TokenExpirationWatch />
        <Socket />
        <Nav />

        <Switch>
          <Route path="/admin/dashboard" exact component={Dashboard} />
          <Route path="/admin/candidates" component={Candidate} />
          <Route path="/admin/voteTokens" component={VoteToken} />
          <Route path="/admin/chart" component={Chart} />
          <Route path="/admin/users" component={User} />
          <Route path="/admin/profile" component={Profile} />
          <Route path="/admin/signOut" component={SignOut} />

          <Route
            path="*"
            component={() => <Redirect to="/admin/dashboard" />}
          />
        </Switch>
        <br />
        <br />
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  };
}

export default compose(connect(mapStateToProps))(App);
