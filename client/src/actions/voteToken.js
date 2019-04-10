import votingApi from "../apis/voting";
import {
  VOTE_TOKENS_CREATE,
  VOTE_TOKENS_GET,
  VOTE_TOKEN_GET_BY_ID,
  VOTE_TOKEN_UPDATE_BY_VALUE,
  VOTE_TOKEN_DELETE_BY_ID
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
}) => async dispatch => {
  const response = await votingApi({ onUploadProgress }).post(`/voteTokens`, {
    voteTokenCount,
    socketId
  });
  const payload = { voteTokens: response.data };
  dispatch({
    type: VOTE_TOKENS_CREATE,
    payload
  });
  return payload;
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

export const isVoteTokenAvailableByValue = value => async dispatch => {
  const response = await votingApi().post(`/voteTokens/available`, {
    value
  });
  const payload = { available: response.data };
  return payload;
};

export const updateVoteTokenByValue = ({
  value,
  candidateId
}) => async dispatch => {
  const response = await votingApi().put(`/voteTokens`, {
    value,
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
