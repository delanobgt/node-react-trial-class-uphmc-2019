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

import Nav from "./Nav/Loadable";
import Profile from "./Profile/Loadable";

import Dashboard from "./Dashboard/Loadable";

import SignOut from "./Auth/SignOut/Loadable";
import DyingDialog from "./Auth/DyingDialog";
import TokenExpirationWatch from "./Auth/TokenExpirationWatch";

import Result from "./Result/Loadable";
import Candidate from "./Candidate/Loadable";
import VoteToken from "./VoteToken/Loadable";
import User from "./User/Loadable";

class App extends Component {
  render() {
    return (
      <Fragment>
        <DyingDialog />
        <TokenExpirationWatch />
        <Nav />

        {/* <Grid container justify="center">
          <Grid item xs={11}>
            <Paper
              style={{
                marginBottom: "1.5em",
                padding: "1em 1.5em",
                display: "flex"
              }}
            >
              {breadcrumb.paths.map((path, index) => (
                <Fragment key={path.to || path}>
                  {index === 0 && (
                    <HomeIcon fontSize="small" style={{ marginRight: "0em" }} />
                  )}
                  <NavigateNextIcon fontSize="small" />
                  {path.to ? (
                    <BreadcrumbLink to={path.to}>{path.text}</BreadcrumbLink>
                  ) : (
                    <Typography color="textPrimary">{path}</Typography>
                  )}
                </Fragment>
              ))}
            </Paper>
          </Grid>
        </Grid> */}

        <Switch>
          <Route path="/admin/result" component={Result} />
          <Route path="/admin/dashboard" exact component={Dashboard} />
          <Route path="/admin/candidates" component={Candidate} />
          <Route path="/admin/voteTokens" component={VoteToken} />
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
