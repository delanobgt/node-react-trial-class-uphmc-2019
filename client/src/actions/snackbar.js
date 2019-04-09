import _ from "lodash";
import moment from "moment";
import { SNACKBAR_SHOW, SNACKBAR_HIDE } from "../reducers/snackbar";

export const hideSnackbar = id => {
  return {
    type: SNACKBAR_HIDE,
    payload: { id }
  };
};

const actionCreatorFactory = variant => (message, params) => ({
  type: SNACKBAR_SHOW,
  payload: {
    id: moment().valueOf(),
    variant,
    message,
    ...(params ? _.pick(params, ["undoCallback", "closeCallback"]) : {})
  }
});

export const plainSnackbar = actionCreatorFactory("plain");
export const successSnackbar = actionCreatorFactory("success");
export const errorSnackbar = actionCreatorFactory("error");
export const warningSnackbar = actionCreatorFactory("warning");
export const infoSnackbar = actionCreatorFactory("info");
