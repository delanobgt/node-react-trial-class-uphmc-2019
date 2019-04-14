import votingApi from "../apis/voting";
import {
  CANDIDATE_CREATE,
  CANDIDATES_GET,
  CANDIDATE_GET_BY_ID,
  CANDIDATE_UPDATE_BY_ID,
  CANDIDATE_DELETE_BY_ID,
  CANDIDATE_REMOVE_BY_ID
} from "../reducers/candidate";

export const emptyCandidates = () => dispatch => {
  dispatch({
    type: CANDIDATES_GET,
    payload: { candidates: {} }
  });
};

export const createCandidate = ({
  data: { orderNumber, fullname, major, imageFile },
  onUploadProgress,
  socketId
}) => async dispatch => {
  const formData = new FormData();
  formData.append("orderNumber", orderNumber);
  formData.append("fullname", fullname);
  formData.append("major", major);
  formData.append("imageFile", imageFile);
  formData.append("socketId", socketId);
  const response = await votingApi({ onUploadProgress }).post(
    `/candidates`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" }
    }
  );
  const payload = { candidate: response.data };
  dispatch({
    type: CANDIDATE_CREATE,
    payload
  });
  return payload;
};

export const getCandidates = () => async dispatch => {
  const response = await votingApi().get(`/candidates`);
  const payload = { candidates: response.data };
  dispatch({
    type: CANDIDATES_GET,
    payload
  });
  return payload;
};

export const getCandidateById = id => async dispatch => {
  const response = await votingApi().get(`/candidates/${id}`);
  const payload = { candidate: response.data };
  dispatch({
    type: CANDIDATE_GET_BY_ID,
    payload
  });
  return payload;
};

export const updateCandidateById = (
  id,
  {
    data: { orderNumber, fullname, major, imageFile },
    onUploadProgress,
    socketId
  }
) => async dispatch => {
  const formData = new FormData();
  formData.append("orderNumber", orderNumber);
  formData.append("fullname", fullname);
  formData.append("major", major);
  formData.append("imageFile", imageFile);
  formData.append("socketId", socketId);
  const response = await votingApi({ onUploadProgress }).put(
    `/candidates/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" }
    }
  );
  const payload = { candidate: response.data };
  dispatch({
    type: CANDIDATE_UPDATE_BY_ID,
    payload
  });
  return payload;
};

export const deleteCandidateById = id => async dispatch => {
  const response = await votingApi().delete(`/candidates/${id}`);
  const payload = { id: response.data.id };
  dispatch({
    type: CANDIDATE_DELETE_BY_ID,
    payload
  });
  return payload;
};

export const removeCandidateById = id => async dispatch => {
  const payload = { id };
  dispatch({
    type: CANDIDATE_REMOVE_BY_ID,
    payload
  });
  return payload;
};
