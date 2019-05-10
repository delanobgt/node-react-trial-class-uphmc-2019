import mainApi from "../apis/main";
import {
  PARTICIPANT_CREATE,
  PARTICIPANTS_GET,
  PARTICIPANT_GET_BY_ID,
  PARTICIPANT_UPDATE_BY_ID,
  PARTICIPANT_DELETE_BY_ID,
  PARTICIPANT_REMOVE_BY_ID
} from "../reducers/participant";

export const emptyParticipants = () => dispatch => {
  dispatch({
    type: PARTICIPANTS_GET,
    payload: { participants: {} }
  });
};

export const createParticipant = ({
  fullname,
  email,
  courses
}) => async dispatch => {
  const response = await mainApi().post(`/participants`, {
    fullname,
    email,
    courses
  });
  const payload = { participant: response.data };
  dispatch({
    type: PARTICIPANT_CREATE,
    payload
  });
  return payload;
};

export const getParticipants = () => async dispatch => {
  const response = await mainApi().get(`/participants`);
  const payload = { participants: response.data };
  dispatch({
    type: PARTICIPANTS_GET,
    payload
  });
  return payload;
};

export const getParticipantById = id => async dispatch => {
  const response = await mainApi().get(`/participants/${id}`);
  const payload = { participant: response.data };
  dispatch({
    type: PARTICIPANT_GET_BY_ID,
    payload
  });
  return payload;
};

export const updateParticipantById = (
  id,
  { fullname, email, courses }
) => async dispatch => {
  const response = await mainApi().put(`/participants/${id}`, {
    fullname,
    email,
    courses
  });
  const payload = { participant: response.data };
  dispatch({
    type: PARTICIPANT_UPDATE_BY_ID,
    payload
  });
  return payload;
};

export const deleteParticipantById = id => async dispatch => {
  const response = await mainApi().delete(`/participants/${id}`);
  const payload = { id: response.data.id };
  dispatch({
    type: PARTICIPANT_DELETE_BY_ID,
    payload
  });
  return payload;
};

export const removeParticipantById = id => async dispatch => {
  const payload = { id };
  dispatch({
    type: PARTICIPANT_REMOVE_BY_ID,
    payload
  });
  return payload;
};
