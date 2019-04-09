import _ from "lodash";
import votingApi from "../apis/voting";
import {
  CONFIGURATION_GET,
  CONFIGURATION_UPDATE,
  CONFIGURATION_MODIFIED_SET
} from "../reducers/configuration";

export const getConfiguration = () => async dispatch => {
  const response = await votingApi().get(`/configuration`);
  const payload = { configuration: response.data };
  dispatch({
    type: CONFIGURATION_GET,
    payload
  });
};

export const updateConfiguration = params => async dispatch => {
  const response = await votingApi().put(
    `/configuration`,
    _.pick(params, ["dosenTidakTetapMaxTime", "leaveQuotas"])
  );
  const payload = { configuration: response.data };
  dispatch({
    type: CONFIGURATION_UPDATE,
    payload
  });
};

export const setConfigurationModified = configurationModified => {
  return {
    type: CONFIGURATION_MODIFIED_SET,
    payload: { configurationModified }
  };
};
