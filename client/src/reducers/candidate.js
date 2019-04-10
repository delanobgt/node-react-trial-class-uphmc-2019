import _ from "lodash";

export const CANDIDATE_CREATE = "CANDIDATE_CREATE";
export const CANDIDATES_GET = "CANDIDATES_GET";
export const CANDIDATE_GET_BY_ID = "EMPLOYEE_GET_BY_ID";
export const CANDIDATE_UPDATE_BY_ID = "CANDIDATE_UPDATE_BY_ID";
export const CANDIDATE_DELETE_BY_ID = "EMPLOYEE_DELETE_BY_ID";

const INITIAL_STATE = {
  candidates: {}
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CANDIDATES_GET: {
      const { candidates } = action.payload;
      return {
        ...state,
        candidates: _.mapKeys(candidates, "_id")
      };
    }
    case CANDIDATE_CREATE:
    case CANDIDATE_GET_BY_ID:
    case CANDIDATE_UPDATE_BY_ID: {
      const { candidate } = action.payload;
      return {
        ...state,
        candidates: {
          ...state.candidates,
          [candidate._id]: candidate
        }
      };
    }
    case CANDIDATE_DELETE_BY_ID: {
      const { id } = action.payload;
      return {
        ...state,
        candidates: _.pickBy(
          state.candidates,
          candidate => candidate._id !== id
        )
      };
    }
    default: {
      return state;
    }
  }
}
