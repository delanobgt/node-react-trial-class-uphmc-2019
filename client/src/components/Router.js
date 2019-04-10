import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import { compose } from "redux";
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from "@material-ui/icons";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";

import Nav from "./main/admin/Nav/Loadable";
import Profile from "./main/admin/Profile/Loadable";
import Socket from "./main/admin/Socket";
import Snackbar from "./misc/Snackbar";

import Dashboard from "./main/admin/Dashboard/Loadable";

import SignIn from "./main/admin/Auth/SignIn/Loadable";
import SignOut from "./main/admin/Auth/SignOut/Loadable";
import ForgetPassword from "./main/admin/Auth/ForgetPassword/Loadable";
import ResetPassword from "./main/admin/Auth/ResetPassword/Loadable";
import DyingDialog from "./main/admin/Auth/DyingDialog";
import TokenExpirationWatch from "./main/admin/Auth/TokenExpirationWatch";

import CandidateList from "./main/user/CandidateList/Loadable";

import Candidate from "./main/admin/Candidate/Loadable";
import VoteToken from "./main/admin/VoteToken/Loadable";
import User from "./main/admin/User";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Fragment>
          <Snackbar />
          <Switch>
            <Route
              path="/resetpassword/users/:userId/email/:email/token/:token"
              component={ResetPassword}
            />
            {!this.props.token ? (
              <Fragment>
                <Switch>
                  <Route path="/candidateList" component={CandidateList} />
                  <Route path="/openSesame" component={SignIn} />
                  <Route path="/forgetPassword" component={ForgetPassword} />
                  <Route
                    path="*"
                    component={() => <Redirect to="/candidateList" />}
                  />
                </Switch>
              </Fragment>
            ) : (
              <Fragment>
                <Socket />
                <DyingDialog />
                <TokenExpirationWatch />
                <Nav />

                <Grid container justify="center">
                  <Grid item xs={11}>
                    <Paper
                      style={{
                        marginBottom: "1.5em",
                        padding: "1em 1.5em",
                        display: "flex"
                      }}
                    >
                      {/* {breadcrumb.paths.map((path, index) => (
                        <Fragment key={path.to || path}>
                          {index === 0 && (
                            <HomeIcon
                              fontSize="small"
                              style={{ marginRight: "0em" }}
                            />
                          )}
                          <NavigateNextIcon fontSize="small" />
                          {path.to ? (
                            <BreadcrumbLink to={path.to}>
                              {path.text}
                            </BreadcrumbLink>
                          ) : (
                            <Typography color="textPrimary">{path}</Typography>
                          )}
                        </Fragment>
                      ))} */}
                    </Paper>
                  </Grid>
                </Grid>

                <Switch>
                  <Route path="/dashboard" exact component={Dashboard} />
                  <Route path="/candidates" component={Candidate} />
                  <Route path="/voteTokens" component={VoteToken} />
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
