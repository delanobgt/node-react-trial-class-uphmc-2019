import _ from "lodash";
import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import classNames from "classnames";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
import green from "@material-ui/core/colors/green";
import amber from "@material-ui/core/colors/amber";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import { withStyles } from "@material-ui/core/styles";

import * as snackbarActions from "../../actions/snackbar";

const variantIcon = {
  plain: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const styles1 = theme => ({
  plain: {
    backgroundColor: "black"
  },
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.main
  },
  info: {
    backgroundColor: theme.palette.primary.light
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit
  },
  message: {
    display: "flex",
    alignItems: "center"
  }
});

class MySnackbarContent extends React.Component {
  handleCloseClick = id => {
    const { hideSnackbar, closeCallback } = this.props;
    if (closeCallback) closeCallback();
    hideSnackbar(id);
  };

  handleUndoClick = id => {
    const { hideSnackbar, undoCallback } = this.props;
    if (undoCallback) undoCallback();
    hideSnackbar(id);
  };

  render() {
    const {
      classes,
      className,
      message,
      variant,
      id,
      undoCallback
    } = this.props;
    const Icon = variantIcon[variant];

    return (
      <SnackbarContent
        className={classNames(classes[variant], className)}
        aria-describedby="client-snackbar"
        message={
          <span id="client-snackbar" className={classes.message}>
            <Icon className={classNames(classes.icon, classes.iconVariant)} />
            {message}
          </span>
        }
        action={[
          ...(undoCallback
            ? [
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => this.handleUndoClick(id)}
                >
                  Undo
                </Button>
              ]
            : []),
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={() => this.handleCloseClick(id)}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
      />
    );
  }
}

const MySnackbarContentWrapper = compose(
  withStyles(styles1),
  connect(
    null,
    snackbarActions
  )
)(MySnackbarContent);

const styles2 = theme => ({
  margin: {
    margin: theme.spacing.unit
  }
});

class CustomizedSnackbars extends React.Component {
  handleClose = (id, closeCallback) => (event, reason) => {
    if (reason === "clickaway") return;
    if (closeCallback) closeCallback();
    this.props.hideSnackbar(id);
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        {_.map(this.props.toasters, toaster => (
          <Snackbar
            key={toaster.id}
            anchorOrigin={{
              vertical: "top",
              horizontal: "center"
            }}
            open={Boolean(toaster.open)}
            autoHideDuration={2500}
            onClose={this.handleClose(toaster.id, toaster.closeCallback)}
          >
            <MySnackbarContentWrapper
              id={toaster.id}
              variant={toaster.variant}
              className={classes.margin}
              message={toaster.message}
              undoCallback={toaster.undoCallback}
              closeCallback={toaster.closeCallback}
            />
          </Snackbar>
        ))}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.snackbar
  };
}

export default compose(
  withStyles(styles2),
  connect(
    mapStateToProps,
    snackbarActions
  )
)(CustomizedSnackbars);
