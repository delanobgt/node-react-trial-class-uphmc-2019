import React, { Component, Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import requireAuth from "../../hoc/requireAuth";

class Welcome extends Component {
  render() {
    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper elevation={3} style={{ padding: "2em" }}>
              <Typography variant="subtitle1" align="center">
                Welcome!
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default requireAuth(Welcome);
