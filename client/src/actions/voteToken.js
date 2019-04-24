import votingApi from "../apis/voting";
import {
  VOTE_TOKENS_GET,
  VOTE_TOKEN_GET_BY_ID,
  VOTE_TOKEN_UPDATE_BY_VALUE,
  VOTE_TOKEN_DELETE_BY_ID,
  VOTE_TOKEN_REMOVE_BY_ID
} from "../reducers/voteToken";

export const emptyVoteTokens = () => dispatch => {
  dispatch({
    type: VOTE_TOKENS_GET,
    payload: { voteTokens: {} }
  });
};

export const createVoteTokens = ({
  voteTokenCount,
  onUploadProgress,
  socketId
}) => async () => {
  const response = await votingApi({ onUploadProgress }).post(`/voteTokens`, {
    voteTokenCount,
    socketId
  });
  return response.data;
};

export const getVoteTokens = () => async dispatch => {
  const response = await votingApi().get(`/voteTokens`);
  const payload = { voteTokens: response.data };
  dispatch({
    type: VOTE_TOKENS_GET,
    payload
  });
  return payload;
};

export const getVoteTokenById = id => async dispatch => {
  const response = await votingApi().get(`/voteTokens/${id}`);
  const payload = { voteToken: response.data };
  dispatch({
    type: VOTE_TOKEN_GET_BY_ID,
    payload
  });
  return payload;
};

export const updateVoteTokenByValue = ({
  tokenValue,
  captchaValue,
  candidateId
}) => async dispatch => {
  const response = await votingApi().put(`/voteTokens`, {
    tokenValue,
    captchaValue,
    candidateId
  });
  const payload = { voteToken: response.data };
  dispatch({
    type: VOTE_TOKEN_UPDATE_BY_VALUE,
    payload
  });
  return payload;
};

export const deleteVoteTokenById = id => async dispatch => {
  const response = await votingApi().delete(`/voteTokens/${id}`);
  const payload = { id: response.data.id };
  dispatch({
    type: VOTE_TOKEN_DELETE_BY_ID,
    payload
  });
  return payload;
};

export const removeVoteTokenById = id => async dispatch => {
  const payload = { id };
  dispatch({
    type: VOTE_TOKEN_REMOVE_BY_ID,
    payload
  });
  return payload;
};
