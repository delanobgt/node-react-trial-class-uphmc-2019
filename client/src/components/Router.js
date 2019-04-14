import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import { compose } from "redux";
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from "@material-ui/icons";

import Snackbar from "./misc/Snackbar";
import Socket from "./main/admin/Socket";

import SignIn from "./main/admin/Auth/SignIn/Loadable";
import ForgetPassword from "./main/admin/Auth/ForgetPassword/Loadable";
import ResetPassword from "./main/admin/Auth/ResetPassword/Loadable";

import CandidateList from "./main/user/CandidateList/Loadable";
import ThankYou from "./main/user/ThankYou/Loadable";

import Result from "./main/user/Result/Loadable";
import AdminRouter from "./main/admin/AdminRouter";

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
                  <Route path="/thankYou" component={ThankYou} />
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
                <Switch>
                  <Route path="/result" component={Result} />
                  <Route path="/admin" component={AdminRouter} />
                  <Route path="*" component={() => <Redirect to="/admin" />} />
                </Switch>
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
