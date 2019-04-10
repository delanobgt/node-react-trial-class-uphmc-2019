import _ from "lodash";

export const VOTE_TOKENS_CREATE = "VOTE_TOKENS_CREATE";
export const VOTE_TOKENS_GET = "VOTE_TOKENS_GET";
export const VOTE_TOKEN_GET_BY_ID = "VOTE_TOKEN_GET_BY_ID";
export const VOTE_TOKEN_UPDATE_BY_VALUE = "VOTE_TOKEN_UPDATE_BY_VALUE";
export const VOTE_TOKEN_DELETE_BY_ID = "VOTE_TOKEN_DELETE_BY_ID";

const INITIAL_STATE = {
  voteTokens: {}
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case VOTE_TOKENS_GET: {
      const { voteTokens } = action.payload;
      return {
        ...state,
        voteTokens: _.mapKeys(voteTokens, "_id")
      };
    }
    case VOTE_TOKENS_CREATE: {
      const { voteTokens } = action.payload;
      return {
        ...state,
        voteTokens: {
          ...state.voteTokens,
          ..._.mapKeys(voteTokens, "_id")
        }
      };
    }
    case VOTE_TOKEN_GET_BY_ID:
    case VOTE_TOKEN_UPDATE_BY_VALUE: {
      const { voteToken } = action.payload;
      return {
        ...state,
        voteTokens: {
          ...state.voteTokens,
          [voteToken._id]: voteToken
        }
      };
    }
    case VOTE_TOKEN_DELETE_BY_ID: {
      const { id } = action.payload;
      return {
        ...state,
        voteTokens: _.pickBy(
          state.voteTokens,
          voteToken => voteToken._id !== id
        )
      };
    }
    default: {
      return state;
    }
  }
}
