import _ from "lodash";
import votingApi from "../apis/voting";
import {
  CONFIGURATION_GET,
  CONFIGURATION_UPDATE
} from "../reducers/configuration";

export const getConfiguration = () => async dispatch => {
  const response = await votingApi().get(`/configuration`);
  const payload = { configuration: response.data };
  dispatch({
    type: CONFIGURATION_GET,
    payload
  });
  return payload;
};

export const updateConfiguration = params => async dispatch => {
  const response = await votingApi().put(
    `/configuration`,
    _.pick(params, ["openTimestamp", "closeTimestamp", "onAir"])
  );
  const payload = { configuration: response.data };
  dispatch({
    type: CONFIGURATION_UPDATE,
    payload
  });
  return payload;
};
