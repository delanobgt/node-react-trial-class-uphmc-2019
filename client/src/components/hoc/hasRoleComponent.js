import React, { Component } from "react";
import { connect } from "react-redux";

export default requiredRole => ChildComponent => {
  class ComposedComponent extends Component {
    render() {
      const { role } = this.props;
      return role == requiredRole ? ChildComponent : null;
    }
  }

  function mapStateToProps(state) {
    return {
      ...state.auth
    };
  }

  const MyComponent = connect(mapStateToProps)(ComposedComponent);

  return <MyComponent />;
};
