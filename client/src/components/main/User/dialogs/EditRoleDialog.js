import _ from "lodash";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";

import * as usersActions from "../../../../actions/user";
import * as snackbarActions from "../../../../actions/snackbar";

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

const INITIAL_STATE = {
  submitStatus: IDLE,
  selectedRole: ""
};

class EditRoleDialog extends React.Component {
  state = INITIAL_STATE;

  onRadioChange = e => {
    const { state, name, toggleDialog } = this.props;
    toggleDialog(name)({ ...state[name], role: e.target.value });
  };

  onSave = async () => {
    const {
      state,
      name,
      toggleDialog,
      updateUserById,
      errorSnackbar,
      successSnackbar
    } = this.props;
    const { _id, role } = state[name] || {};

    try {
      this.setState({ submitStatus: SUBMITTING });
      await updateUserById(_id, { role });
      toggleDialog(name)(false);
      successSnackbar(`role saved!`);
    } catch (error) {
      errorSnackbar(`Please try again`);
    } finally {
      this.setState({ submitStatus: IDLE });
    }
  };

  onClose = () => {
    const { toggleDialog, name } = this.props;
    toggleDialog(name)(false);
  };

  render() {
    const { state, name } = this.props;
    const { submitStatus } = this.state;
    const payload = state[name];

    if (!payload) return null;

    const { allRoles, role: selectedRole, ...row } = payload;

    return (
      <div>
        <Dialog open={Boolean(payload)} aria-labelledby="form-dialog-title">
          {Boolean(allRoles && selectedRole) ? (
            <Fragment>
              <DialogTitle id="form-dialog-title">
                Edit <span style={{ color: "blue" }}>{row.email}</span>'s role
              </DialogTitle>
              <DialogContent>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Select a role</FormLabel>
                  <RadioGroup
                    value={selectedRole}
                    onChange={this.onRadioChange}
                  >
                    {_.sortBy(allRoles, [role => role]).map(role => (
                      <FormControlLabel
                        key={role}
                        value={role}
                        control={<Radio />}
                        label={role}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.onClose}
                  color="primary"
                  disabled={submitStatus === SUBMITTING}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  disabled={submitStatus === SUBMITTING}
                  onClick={this.onSave}
                >
                  {submitStatus === SUBMITTING ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogActions>
            </Fragment>
          ) : (
            "Fetching data..."
          )}
        </Dialog>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default compose(
  connect(
    mapStateToProps,
    { ...usersActions, ...snackbarActions }
  )
)(EditRoleDialog);
