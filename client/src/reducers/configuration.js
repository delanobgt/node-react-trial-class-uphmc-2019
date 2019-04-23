import moment from "moment";

export const CONFIGURATION_GET = "CONFIGURATION_GET";
export const CONFIGURATION_UPDATE = "CONFIGURATION_UPDATE";

const INITIAL_STATE = {
  openMoment: moment(),
  closeMoment: moment(),
  onAir: false
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CONFIGURATION_GET:
    case CONFIGURATION_UPDATE: {
      const { configuration } = action.payload;
      return {
        ...state,
        openMoment: moment(configuration.openTimestamp),
        closeMoment: moment(configuration.closeTimestamp),
        onAir: configuration.onAir
      };
    }
    default: {
      return state;
    }
  }
}
