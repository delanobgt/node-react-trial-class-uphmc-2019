import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import * as authActions from "../../actions/auth";
import UncomfortableDialog from "./small-components/UncomfortableDialog";
import StickyLoading from "./small-components/StickyLoading";

const CHECKING = "CHECKING",
  ERROR = "ERROR",
  DONE = "DONE";

export default ChildComponent => {
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

      if (status === CHECKING) return <StickyLoading />;
      else if (status === ERROR)
        return (
          <UncomfortableDialog
            title="Can't verify profile."
            desc="Please try again."
            callback={() => window.location.reload()}
          />
        );
      else return <ChildComponent {...this.props} />;
    }
  }

  return compose(
    connect(
      null,
      { ...authActions }
    )
  )(ComposedComponent);
};
