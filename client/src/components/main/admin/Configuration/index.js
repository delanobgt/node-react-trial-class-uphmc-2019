import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";

import * as configurationActions from "../../../../actions/configuration";
import * as employeeActions from "../../../../actions/employee";
import requireAuth from "../../../hoc/requireAuth";
import DTTMaxTime from "./sections/DTTMaxTime";
import LeaveQuotas from "./sections/LeaveQuotas";

const DONE = "DONE",
  LOADING = "LOADING",
  ERROR = "ERROR";

const styles = theme => ({
  retryText: {
    textAlign: "center"
  },
  retryButton: {
    display: "block",
    margin: "auto",
    textAlign: "center"
  },
  paper: {
    padding: "1em 2em"
  }
});

class ConfigurationIndex extends React.Component {
  state = {
    loadingStatus: LOADING,
    kategoriPegawaiEnums: []
  };

  fetchConfiguration = async () => {
    const { getConfiguration, getKategoriPegawaiEnums } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      await getConfiguration();
      const { kategoriPegawaiEnums } = await getKategoriPegawaiEnums();
      this.setState({ loadingStatus: DONE, kategoriPegawaiEnums });
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  async componentDidMount() {
    await this.fetchConfiguration();
  }

  render() {
    const { loadingStatus, kategoriPegawaiEnums } = this.state;
    const { classes } = this.props;

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5">Configurations</Typography>
            </Paper>
            <br />
            {loadingStatus === ERROR ? (
              <Fragment>
                <Typography variant="subtitle1" className={classes.retryText}>
                  Cannot fetch configuration!
                </Typography>
                <Button
                  color="primary"
                  className={classes.retryButton}
                  onClick={() => this.fetchConfiguration()}
                >
                  Retry
                </Button>
              </Fragment>
            ) : loadingStatus === LOADING ? (
              <div style={{ textAlign: "center" }}>
                <CircularProgress size={50} />
              </div>
            ) : (
              <Fragment>
                <DTTMaxTime />
                <br />
                <LeaveQuotas kategoriPegawaiEnums={kategoriPegawaiEnums} />
              </Fragment>
            )}
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...configurationActions, ...employeeActions }
  ),
  requireAuth
)(ConfigurationIndex);
