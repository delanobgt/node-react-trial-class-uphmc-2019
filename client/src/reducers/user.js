import _ from "lodash";
export const USER_CREATE = "USER_CREATE";
export const USERS_GET = "USERS_GET";
export const USER_GET_BY_ID = "USER_GET_BY_ID";
export const USER_UPDATE_BY_ID = "USER_UPDATE_BY_ID";
export const USER_DELETE_BY_ID = "USER_DELETE_BY_ID";
export const USER_REMOVE_BY_ID = "USER_REMOVE_BY_ID";

const INITIAL_STATE = {
  users: {}
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case USER_CREATE:
    case USER_GET_BY_ID:
    case USER_UPDATE_BY_ID: {
      const { user } = action.payload;
      return {
        ...state,
        users: {
          ...state.users,
          [user._id]: user
        }
      };
    }
    case USERS_GET: {
      const { users } = action.payload;
      return {
        ...state,
        users: _.mapKeys(users, "_id")
      };
    }
    case USER_REMOVE_BY_ID:
    case USER_DELETE_BY_ID: {
      const { id } = action.payload;
      return {
        ...state,
        users: _.pickBy(state.users, user => user._id !== id)
      };
    }
    default: {
      return state;
    }
  }
}
