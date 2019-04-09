import "react-table/react-table.css";
import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import {
  Flare as FlareIcon,
  FiberManualRecord as FiberManualRecordIcon
} from "@material-ui/icons";

import * as userActions from "../../../../actions/user";
import * as snackbarActions from "../../../../actions/snackbar";
import hasRole from "../../../hoc/hasRole";
import CreateUserDialog from "./dialogs/CreateUserDialog";
import EditRoleDialog from "./dialogs/EditRoleDialog";
import ResetUserPasswordDialog from "./dialogs/ResetUserPasswordDialog";
import BanUserDialog from "./dialogs/BanUserDialog";
import DeleteUserDialog from "./dialogs/DeleteUserDialog";
import Table, { ExcelButton } from "./Table";

// FETCHING DATA STATUS
const LOADING = "LOADING",
  ERROR = "ERROR",
  DONE = "DONE";

const styles = theme => ({
  actionDiv: {
    display: "flex",
    justifyContent: "space-between",
    margin: "0.5em 0"
  },
  paper: {
    padding: "2em"
  }
});

class UserIndex extends React.Component {
  state = {
    loadingStatus: LOADING,
    allRoles: []
  };

  toggleDialog = stateName => open =>
    this.setState(state => ({
      [stateName]: open === undefined ? !Boolean(state[stateName]) : open
    }));

  async componentDidMount() {
    await this.fetchData();
  }

  fetchData = async () => {
    const { getUsers, getAllRoles } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      await getUsers();
      const { roles } = await getAllRoles();
      this.setState({
        allRoles: roles,
        loadingStatus: DONE
      });
    } catch (error) {
      console.log({ error });
      return this.setState({ loadingStatus: ERROR });
    }
  };

  render() {
    const { users, classes } = this.props;
    const { loadingStatus, allRoles } = this.state;

    let mainContent = null;

    if (loadingStatus === ERROR) {
      mainContent = (
        <div style={{ textAlign: "center", margin: "1em 0" }}>
          <Typography variant="subtitle1">Failed to fetch data!</Typography>
          <Button
            color="primary"
            className={classes.button}
            onClick={this.fetchData}
          >
            Retry
          </Button>
        </div>
      );
    } else if (loadingStatus === LOADING) {
      mainContent = (
        <CircularProgress
          size={50}
          style={{ display: "block", margin: "1em auto" }}
        />
      );
    } else {
      const data = _.chain(users)
        .values()
        .map((user, index) => ({ ...user, orderNo: index + 1 }))
        .value();

      mainContent = (
        <Fragment>
          <div style={{ display: "flex", alignItems: "center" }}>
            <FiberManualRecordIcon
              style={{
                color: "limegreen",
                marginRight: "0.35em"
              }}
            />
            <Typography variant="subtitle1">
              {data.filter(user => user.connected).length}{" "}
              <span style={{ color: "limegreen" }}>online</span>
            </Typography>
          </div>

          <div className={classes.actionDiv}>
            <ExcelButton data={data} />
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.toggleDialog("CreateUserDialog")(true)}
            >
              Create New <FlareIcon style={{ marginLeft: "0.5em" }} />
            </Button>
          </div>
          <Table
            data={data}
            props={this.props}
            toggleDialog={this.toggleDialog}
            allRoles={allRoles}
          />
        </Fragment>
      );
    }

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" gutterBottom>
                All Users
              </Typography>
              <br />
              {mainContent}
            </Paper>
          </Grid>
        </Grid>
        <CreateUserDialog
          name="CreateUserDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <EditRoleDialog
          name="EditRoleDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <ResetUserPasswordDialog
          name="ResetUserPasswordDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <BanUserDialog
          name="BanUserDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
        <DeleteUserDialog
          name="DeleteUserDialog"
          state={this.state}
          toggleDialog={this.toggleDialog}
        />
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.user,
    ...state.auth
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...userActions, ...snackbarActions }
  ),
  hasRole("SUPER_ADMIN")
)(UserIndex);
