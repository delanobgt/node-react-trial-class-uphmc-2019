import moment from "moment";

export const CONFIGURATION_GET = "CONFIGURATION_GET";
export const CONFIGURATION_UPDATE = "CONFIGURATION_UPDATE";

const INITIAL_STATE = {
  managementMoment: moment(),
  accountingMoment: moment(),
  hospitalityMoment: moment(),
  systechMoment: moment(),
  lawMoment: moment()
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CONFIGURATION_GET:
    case CONFIGURATION_UPDATE: {
      const { configuration } = action.payload;
      return {
        ...state,
        managementMoment: moment(configuration.managementDate),
        accountingMoment: moment(configuration.accountingDate),
        hospitalityMoment: moment(configuration.hospitalityDate),
        systechMoment: moment(configuration.systechDate),
        lawMoment: moment(configuration.lawDate)
      };
    }
    default: {
      return state;
    }
  }
}
