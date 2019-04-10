import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

const styles = theme => ({
  textField: {
    margin: "0.5em 0"
  },
  formControl: {},
  picture: {
    width: "250px",
    height: "250px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  }
});

class ViewQRCodeDialog extends React.Component {
  onClose = () => {
    const { name, toggleDialog } = this.props;
    toggleDialog(name)(false);
  };

  render() {
    const { state, name, classes } = this.props;
    const voteToken = state[name];

    if (!voteToken) return null;

    return (
      <div>
        <Dialog
          open={Boolean(voteToken)}
          onClose={this.onClose}
          aria-labelledby="form-dialog-title"
        >
          <Fragment>
            <DialogTitle id="form-dialog-title">View QR Code</DialogTitle>
            <DialogContent>
              <div
                className={classes.picture}
                style={{
                  backgroundImage: `url(${process.env.REACT_APP_API_BASE_URL ||
                    window.location.origin}/api/voteTokens/${
                    voteToken._id
                  }/generateQRCode)`
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.onClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Fragment>
        </Dialog>
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(null)
)(ViewQRCodeDialog);
