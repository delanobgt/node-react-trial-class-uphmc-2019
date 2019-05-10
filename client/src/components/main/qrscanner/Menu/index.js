import React, { Component } from "react";
import { compose } from "redux";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { KeyboardBackspace as KeyboardBackspaceIcon } from "@material-ui/icons";

import CleanLink from "../../../misc/CleanLink";

const styles = theme => ({
  root: {
    display: "flex"
  },
  formControl: {
    margin: theme.spacing.unit * 3
  },
  group: {
    margin: `${theme.spacing.unit}px 0`
  }
});

class QRScannerMenu extends Component {
  render() {
    const { history } = this.props;

    const BackButton = () => (
      <CleanLink to="/dashboard">
        <Button variant="outlined" color="primary" size="small">
          <KeyboardBackspaceIcon style={{ marginRight: "0.35em" }} />
          back to dashboard
        </Button>
      </CleanLink>
    );

    return (
      <Grid container justify="center">
        <Grid item xs={11} sm={6} md={4} lg={4}>
          <BackButton />
          <br />
          <br />

          <Typography variant="subtitle1">Choose a scanner type</Typography>
          <br />

          <Button
            variant="contained"
            color="primary"
            onClick={() => history.push("/qrscanner/scanners/signIn")}
            fullWidth
          >
            Sign In
          </Button>
          <br />
          <br />
          <Button
            variant="contained"
            color="primary"
            onClick={() => history.push("/qrscanner/scanners/signOut")}
            fullWidth
          >
            Sign Out
          </Button>
          <br />
          <br />
          <Button
            variant="contained"
            color="primary"
            onClick={() => history.push("/qrscanner/scanners/complete")}
            fullWidth
          >
            Complete
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default compose(withStyles(styles))(QRScannerMenu);
