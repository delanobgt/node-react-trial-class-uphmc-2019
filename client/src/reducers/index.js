import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import auth from "./auth";
import configuration from "./configuration";
import nav from "./nav";
import participant from "./participant";
import snackbar from "./snackbar";
import user from "./user";

export default combineReducers({
  auth,
  configuration,
  nav,
  participant,
  snackbar,
  user,
  form: formReducer
});
