import _ from "lodash";
import cheerio from "cheerio";
import votingApi from "../apis/voting";
import {
  AUTH_DYING_DIALOG,
  AUTH_SIGN_IN,
  AUTH_SIGN_OUT,
  SELF_EMAIL_UPDATE,
  SELF_PROFILE_GET,
  SELF_CONNECTED_UPDATE
} from "../reducers/auth";

export const getSelfProfile = () => async dispatch => {
  try {
    const profileResponse = await votingApi().get(`/users/self/profile`);
    const payload = _.pick(profileResponse.data, [
      "_id",
      "email",
      "role",
      "connected",
      "banned",
      "createdAt"
    ]);
    dispatch({
      type: SELF_PROFILE_GET,
      payload
    });
    return payload;
  } catch (error) {
    console.log("getSelfProfile 1", { error });
    try {
      const tokenCheckResponse = await votingApi().get(
        `/users/self/checkAuthToken`
      );
      const payload = _.pick(tokenCheckResponse.data, ["success"]);
      throw payload;
    } catch (error) {
      console.log("getSelfProfile 2", { error });
      const errorMsg = _.get(
        error,
        "response.data",
        "<pre>Please check your internet connection!</pre>"
      );

      // Unauthorized message masking
      const $ = cheerio.load(
        errorMsg === "Unauthorized"
          ? "<pre>Please login again!</pre>"
          : errorMsg
      );

      // Error message masking
      const parsedErrorMessage =
        $("pre").text() === "Internal Server Error"
          ? "Please login again!"
          : $("pre").text();

      dispatch({
        type: AUTH_DYING_DIALOG,
        payload: { showDyingDialog: parsedErrorMessage }
      });
      // eslint-disable-next-line
      throw { msg: parsedErrorMessage || "Please try again!" };
    }
  }
};

export const hideDyingDialog = () => dispatch => {
  dispatch({
    type: AUTH_DYING_DIALOG,
    payload: { showDyingDialog: false }
  });
};

export const updateSelfConnected = connected => dispatch => {
  dispatch({
    type: SELF_CONNECTED_UPDATE,
    payload: { connected }
  });
};

export const updateSelfEmail = params => async dispatch => {
  const response = await votingApi().put(
    `/users/self/email`,
    _.pick(params, ["email"])
  );
  const payload = _.pick(response.data, ["email"]);
  dispatch({
    type: SELF_EMAIL_UPDATE,
    payload
  });
  return payload;
};

export const updateSelfPassword = params => async dispatch => {
  const response = await votingApi().put(
    `/users/self/password`,
    _.pick(params, ["oldPassword", "newPassword"])
  );
  const payload = _.pick(response.data, ["success"]);
  return payload;
};

export const sendForgetUserPasswordEmail = params => async dispatch => {
  const response = await votingApi().post(
    `/users/password/sendForgetEmail`,
    _.pick(params, ["email"])
  );
  const payload = _.pick(response.data, ["success"]);
  return payload;
};

export const checkResetUserPasswordToken = (
  userId,
  params
) => async dispatch => {
  const response = await votingApi().post(
    `/users/${userId}/password/checkResetToken`,
    _.pick(params, ["token"])
  );
  const payload = _.pick(response.data, ["success"]);
  return payload;
};

export const updateUserPasswordById = (userId, params) => async dispatch => {
  const response = await votingApi().put(
    `/users/${userId}/password`,
    _.pick(params, ["token", "newPassword"])
  );
  const payload = _.pick(response.data, ["success"]);
  return payload;
};

export const signIn = credentials => async dispatch => {
  try {
    const response = await votingApi().post(
      `/auth/signIn`,
      _.pick(credentials, ["email", "password"])
    );
    const payload = _.pick(response.data, ["token", "expiresAt"]);
    localStorage.setItem("authToken", payload.token);
    localStorage.setItem("expiresAt", payload.expiresAt);
    dispatch({
      type: AUTH_SIGN_IN,
      payload
    });
    return payload;
  } catch (error) {
    console.log("signIn", { error });
    const errorMsg = _.get(
      error,
      "response.data",
      "<pre>Please try again!</pre>"
    );

    // Unauthorized message masking
    const $ = cheerio.load(
      errorMsg === "Unauthorized" ? "<pre>Please login again!</pre>" : errorMsg
    );

    // Error message masking
    const parsedErrorMessage =
      $("pre").text() === "Internal Server Error"
        ? "Please login again!"
        : $("pre").text();

    // eslint-disable-next-line
    throw { msg: parsedErrorMessage || "Please try again!" };
  }
};

export const signOut = () => async dispatch => {
  try {
    await votingApi().post(`/auth/signOut`);
  } catch (error) {
    console.log("signOut", { error });
  } finally {
    localStorage.removeItem("authToken");
    dispatch({ type: AUTH_SIGN_OUT });
  }
};
