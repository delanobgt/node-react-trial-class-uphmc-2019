import "react-table/react-table.css";
import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  retryText: {
    textAlign: "center"
  },
  retryButton: {
    display: "block",
    margin: "auto",
    textAlign: "center"
  },
  headline: {
    marginBottom: "1em"
  },
  excelButton: {
    marginBottom: "1em"
  },
  paper: {
    marginTop: "1em",
    padding: "2em"
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "1.5em 0"
  },
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  }
});

class CandidateListIndex extends React.Component {
  render() {
    const { classes, history } = this.props;

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={11}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" gutterBottom>
                Thank you for voting!
              </Typography>
              <div>
                <Button onCLick={() => history.push("/candidateList")}>
                  Back to Candidate List
                </Button>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default compose(withStyles(styles))(CandidateListIndex);
