import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import * as authActions from "../../actions/auth";
import UncomfortableDialog from "./small-components/UncomfortableDialog";
import StickyLoading from "./small-components/StickyLoading";

const CHECKING = "CHECKING",
  ERROR = "ERROR",
  DONE = "DONE";

export default requiredRole => ChildComponent => {
  class ComposedComponent extends Component {
    state = {
      status: CHECKING
    };

    async componentDidMount() {
      const { getSelfProfile } = this.props;
      try {
        this.setState({ status: CHECKING });
        await getSelfProfile();
        this.setState({ status: DONE });
      } catch (error) {
        this.setState({ status: ERROR });
      }
    }

    render() {
      const { status } = this.state;
      const { role, history } = this.props;

      if (status === CHECKING) return <StickyLoading />;
      if (status === ERROR)
        return (
          <UncomfortableDialog
            title="Can't verify profile."
            desc="Please try again."
            callback={() => window.location.reload()}
          />
        );

      if (role && role == requiredRole) {
        return <ChildComponent {...this.props} />;
      } else {
        return (
          <UncomfortableDialog
            title="Access denied!"
            desc={`You lack of the required role: ${requiredRole}`}
            callback={() => history.push("/")}
          />
        );
      }
    }
  }

  function mapStateToProps(state) {
    return {
      ...state.auth
    };
  }

  return compose(
    connect(
      mapStateToProps,
      { ...authActions }
    )
  )(ComposedComponent);
};
