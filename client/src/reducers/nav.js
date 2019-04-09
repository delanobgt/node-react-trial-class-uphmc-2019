import _ from "lodash";

export const TOGGLE_DRAWER = "TOGGLE_DRAWER";
export const TOGGLE_COLLAPSE = "TOGGLE_COLLAPSE";

const INITIAL_STATE = {
  drawerOpen: false,
  navState: {}
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case TOGGLE_DRAWER: {
      const { open } = action.payload;
      return { ...state, drawerOpen: open };
    }
    case TOGGLE_COLLAPSE: {
      const { stateName } = action.payload;
      const { navState } = state;
      const depth = Number(stateName.split("#")[1]);
      return {
        ...state,
        navState: {
          ..._.mapValues(navState, (value, key) =>
            Number(key.split("#")[1]) >= depth ? false : value
          ),
          [stateName]: !Boolean(navState[stateName])
        }
      };
    }
    default: {
      return state;
    }
  }
}
