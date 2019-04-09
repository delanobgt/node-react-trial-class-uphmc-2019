import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Tooltip from "@material-ui/core/Tooltip";
import { FiberManualRecord as FiberManualRecordIcon } from "@material-ui/icons";

import CleanLink from "../../../misc/CleanLink";
import * as navActions from "../../../../actions/nav";

const styles = {
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
};

class MyAppBar extends Component {
  state = {
    auth: true,
    anchorEl: null
  };

  handleChange = event => {
    this.setState({ auth: event.target.checked });
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { email, connected, classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
              onClick={() => this.props.toggleDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" color="inherit" className={classes.grow}>
              Voting System
            </Typography>

            <Hidden xsDown>
              <Typography
                variant="subtitle1"
                style={{
                  display: "flex",
                  color: "white",
                  alignItems: "center"
                }}
              >
                <Tooltip
                  title={connected ? "Online" : "Offline"}
                  placement="top"
                >
                  <FiberManualRecordIcon
                    style={{
                      color: connected ? "limegreen" : "red",
                      marginRight: "0.35em"
                    }}
                  />
                </Tooltip>{" "}
                {email}
              </Typography>
              <IconButton
                aria-owns={open ? "menu-appbar" : null}
                aria-haspopup="true"
                onClick={this.handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right"
                }}
                open={open}
                onClose={this.handleClose}
              >
                <CleanLink to="/profile">
                  <MenuItem onClick={this.handleClose}>
                    <Typography variant="body1">Profile</Typography>
                  </MenuItem>
                </CleanLink>
                <CleanLink to="/signOut">
                  <MenuItem onClick={this.handleClose}>
                    <Typography variant="body1">Logout</Typography>
                  </MenuItem>
                </CleanLink>
              </Menu>
            </Hidden>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...navActions }
  )
)(MyAppBar);
