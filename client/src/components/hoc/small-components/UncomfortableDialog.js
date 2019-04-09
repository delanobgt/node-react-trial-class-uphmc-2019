import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Typography from "@material-ui/core/Typography";

class UncomfortableDialogClass extends Component {
  state = {
    show: true
  };

  onOkay = () => {
    const { callback } = this.props;
    this.setState({ show: false });
    if (callback) callback();
  };

  onClose = () => {
    this.setState({ show: false });
  };

  render() {
    return (
      <div>
        <Dialog open={this.state.show} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">
            <span style={{ color: "red" }}>{this.props.title}</span>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Typography variant="subtitle2">{this.props.desc}</Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onOkay} color="primary">
              Okay
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withRouter(UncomfortableDialogClass);
