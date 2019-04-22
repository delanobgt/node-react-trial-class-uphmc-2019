import "react-table/react-table.css";
import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

import Lotus from "../CandidateList/svg/Lotus";

const styles = theme => ({
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  },
  wrapper: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    width: "50%",
    maxWidth: "300px"
  },
  title: {
    color: "#CFB539",
    margin: "0 1.2em",
    marginTop: "1.25em",
    fontSize: "2.75em",
    textAlign: "center"
  },
  lotus: {
    width: "2em"
  },
  footer: { marginTop: "3.5em", width: "75%", maxWidth: "500px" }
});

class CandidateListIndex extends React.Component {
  render() {
    const { classes, history } = this.props;

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={12}>
            <div className={classes.wrapper}>
              <img
                src={require("../../../../res/images/logo.png")}
                alt=""
                className={classes.logo}
              />

              <p className={classes.title}>THANK YOU FOR YOUR VOTE!</p>

              <Lotus size={50} className={classes.lotus} />

              {/* <div>
                <Button onClick={() => history.push("/candidateList")}>
                  Back to Candidate List
                </Button>
              </div> */}

              <img
                src={require("../../../../res/images/footer.png")}
                alt=""
                className={classes.footer}
              />
            </div>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default compose(withStyles(styles))(CandidateListIndex);
