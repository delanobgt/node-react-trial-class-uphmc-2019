import _ from "lodash";

export const PARTICIPANT_CREATE = "PARTICIPANT_CREATE";
export const PARTICIPANTS_GET = "PARTICIPANTS_GET";
export const PARTICIPANT_GET_BY_ID = "PARTICIPANT_GET_BY_ID";
export const PARTICIPANT_UPDATE_BY_ID = "PARTICIPANT_UPDATE_BY_ID";
export const PARTICIPANT_DELETE_BY_ID = "PARTICIPANT_DELETE_BY_ID";
export const PARTICIPANT_REMOVE_BY_ID = "PARTICIPANT_REMOVE_BY_ID";

const INITIAL_STATE = {
  participants: {}
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case PARTICIPANTS_GET: {
      const { participants } = action.payload;
      return {
        ...state,
        participants: _.mapKeys(participants, "_id")
      };
    }
    case PARTICIPANT_CREATE:
    case PARTICIPANT_GET_BY_ID:
    case PARTICIPANT_UPDATE_BY_ID: {
      const { participant } = action.payload;
      return {
        ...state,
        participants: {
          ...state.participants,
          [participant._id]: participant
        }
      };
    }
    case PARTICIPANT_DELETE_BY_ID:
    case PARTICIPANT_REMOVE_BY_ID: {
      const { id } = action.payload;
      return {
        ...state,
        participants: _.pickBy(
          state.participants,
          participant => participant._id !== id
        )
      };
    }
    default: {
      return state;
    }
  }
}
