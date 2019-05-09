import _ from "lodash";
import votingApi from "../apis/main";
import {
  USER_CREATE,
  USERS_GET,
  USER_GET_BY_ID,
  USER_UPDATE_BY_ID,
  USER_DELETE_BY_ID,
  USER_REMOVE_BY_ID
} from "../reducers/user";

export const createUser = params => async dispatch => {
  const response = await votingApi().post(`/users`, _.pick(params, ["email"]));
  const payload = { user: response.data };
  console.log({ payload });
  dispatch({
    type: USER_CREATE,
    payload
  });
  return payload;
};

export const getUsers = () => async dispatch => {
  const response = await votingApi().get(`/users`);
  const payload = { users: response.data };
  dispatch({
    type: USERS_GET,
    payload
  });
  return payload;
};

export const getAllRoles = () => async dispatch => {
  const response = await votingApi().get(`/users/roles`);
  const payload = { roles: response.data };
  return payload;
};

export const getUserById = id => async dispatch => {
  const response = await votingApi().get(`/users/${id}`);
  const payload = { user: response.data };
  dispatch({
    type: USER_GET_BY_ID,
    payload
  });
  return payload;
};

export const updateUserById = (id, params) => async dispatch => {
  const response = await votingApi().put(
    `/users/${id}`,
    _.pick(params, ["role", "banned"])
  );
  const payload = { user: response.data };
  dispatch({
    type: USER_UPDATE_BY_ID,
    payload
  });
  return payload;
};

export const resetUserPasswordById = id => async dispatch => {
  const response = await votingApi().post(`/users/${id}/password/reset`);
  const payload = _.pick(response.data, ["success"]);
  return payload;
};

export const deleteUserById = id => async dispatch => {
  const response = await votingApi().delete(`/users/${id}`);
  const payload = { id: response.data.id };
  dispatch({
    type: USER_DELETE_BY_ID,
    payload
  });
  return payload;
};

export const removeUserById = id => dispatch => {
  dispatch({
    type: USER_REMOVE_BY_ID,
    payload: { id }
  });
};
