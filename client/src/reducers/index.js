import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import auth from "./auth";
import configuration from "./configuration";
import employee from "./employee";
import nav from "./nav";
import snackbar from "./snackbar";
import user from "./user";

export default combineReducers({
  auth,
  configuration,
  employee,
  nav,
  snackbar,
  user,
  form: formReducer
});
