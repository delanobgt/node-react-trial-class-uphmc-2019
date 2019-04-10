import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import auth from "./auth";
import candidate from "./candidate";
import configuration from "./configuration";
import nav from "./nav";
import snackbar from "./snackbar";
import user from "./user";
import voteToken from "./voteToken";

export default combineReducers({
  auth,
  candidate,
  configuration,
  nav,
  snackbar,
  user,
  voteToken,
  form: formReducer
});
