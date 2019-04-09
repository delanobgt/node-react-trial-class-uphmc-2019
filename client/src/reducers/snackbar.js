import _ from "lodash";

export const SNACKBAR_SHOW = "SNACKBAR_SHOW";
export const SNACKBAR_HIDE = "SNACKBAR_HIDE";

const INITIAL_STATE = {
  toasters: {}
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SNACKBAR_SHOW: {
      const {
        id,
        variant,
        message,
        undoCallback,
        closeCallback
      } = action.payload;
      return {
        toasters: {
          ..._.pickBy(state.toasters, toaster => toaster.open),
          [id]: {
            id,
            open: true,
            variant,
            message,
            undoCallback,
            closeCallback
          }
        }
      };
    }
    case SNACKBAR_HIDE: {
      const { id } = action.payload;
      return {
        toasters: {
          ..._.pickBy(state.toasters, toaster => toaster.open),
          [id]: {
            ...state.toasters[id],
            open: false
          }
        }
      };
    }
    default:
      return state;
  }
}
