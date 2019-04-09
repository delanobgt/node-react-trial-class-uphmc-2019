export const CONFIGURATION_GET = "CONFIGURATION_GET";
export const CONFIGURATION_UPDATE = "CONFIGURATION_UPDATE";
export const CONFIGURATION_MODIFIED_SET = "CONFIGURATION_MODIFIED_SET";

const INITIAL_STATE = {
  dosenTidakTetapMaxTime: null,
  leaveQuotas: [],
  configurationModified: false
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CONFIGURATION_GET:
    case CONFIGURATION_UPDATE: {
      const { configuration } = action.payload;
      return {
        ...state,
        ...configuration
      };
    }
    case CONFIGURATION_MODIFIED_SET: {
      const { configurationModified } = action.payload;
      return {
        ...state,
        configurationModified
      };
    }
    default: {
      return state;
    }
  }
}
