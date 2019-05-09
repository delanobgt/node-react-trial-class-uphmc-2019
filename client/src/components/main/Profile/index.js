import moment from "moment";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import deepOrange from "@material-ui/core/colors/deepOrange";
import { People as PeopleIcon, Person as PersonIcon } from "@material-ui/icons";

import * as authActions from "../../../actions/auth";
import requireAuth from "../../hoc/requireAuth";
import ChangeEmailDialog from "./dialogs/ChangeEmailDialog";
import ChangePasswordDialog from "./dialogs/ChangePasswordDialog";

const styles = theme => ({
  display2: {
    marginBottom: "0.5em"
  },
  avatar: {
    margin: "auto",
    padding: "1.2em",
    color: "#fff",
    fontSize: "3.75em",
    backgroundColor: deepOrange[500]
  },
  avatarContainer: {
    textAlign: "center",
    display: "flex",
    alignItems: "center"
  },
  infoContainer: {},
  info: {
    margin: "1em 0"
  },
  field: {
    ...theme.typography.button,
    backgroundColor: "lightgray",
    padding: theme.spacing.unit,
    textAlign: "center"
  },
  changeButton: {
    margin: "auto 0.8em"
  }
});

const ROLE_ICON = {
  SUPER_ADMIN: PeopleIcon,
  ADMIN: PersonIcon
};

class Profile extends React.Component {
  state = {};

  toggleDialog = stateName => open =>
    this.setState(state => ({
      [stateName]: open === undefined ? !Boolean(state[stateName]) : open
    }));

  render() {
    const { id, email, role, createdAt, classes } = this.props;

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper elevation={3} style={{ padding: "2em" }}>
              <Typography variant="display2" className={classes.display2}>
                Profile
              </Typography>

              <Divider light />

              <Grid container justify="space-around">
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  className={classes.avatarContainer}
                >
                  <Avatar className={classes.avatar}>
                    {email.charAt(0).toUpperCase() + email.charAt(1)}
                  </Avatar>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  className={classes.infoContainer}
                >
                  <div className={classes.info}>
                    <Typography variant="subtitle1">ID</Typography>
                    <Typography className={classes.field}>{id}</Typography>
                  </div>

                  <div className={classes.info}>
                    <Typography variant="subtitle1">Email</Typography>
                    <div style={{ display: "flex" }}>
                      <Typography
                        className={classes.field}
                        style={{ flexGrow: 1 }}
                      >
                        {email}
                      </Typography>
                      <Button
                        size="small"
                        className={classes.changeButton}
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                          this.toggleDialog("ChangeEmailDialog")(true)
                        }
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  <div className={classes.info}>
                    <Typography variant="subtitle1">Password</Typography>
                    <div style={{ display: "flex" }}>
                      <Typography
                        className={classes.field}
                        style={{ flexGrow: 1 }}
                      >
                        {"*".repeat(25)}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        className={classes.changeButton}
                        onClick={() =>
                          this.toggleDialog("ChangePasswordDialog")(true)
                        }
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  <div className={classes.info}>
                    <Typography variant="subtitle1">Role</Typography>
                    <Typography
                      className={classes.field}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {(() => {
                        const RoleIcon = ROLE_ICON[role];
                        return <RoleIcon />;
                      })()}
                      &nbsp;
                      {role}
                    </Typography>
                  </div>

                  <div className={classes.info}>
                    <Typography variant="subtitle1">Joined at</Typography>
                    <Typography className={classes.field}>
                      {moment(createdAt).format("Do MMMM YYYY (HH:mm:ss)")}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <ChangeEmailDialog
          name="ChangeEmailDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <ChangePasswordDialog
          name="ChangePasswordDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
      </Fragment>
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
    authActions
  ),
  requireAuth
)(Profile);
