import { TOGGLE_DRAWER, TOGGLE_COLLAPSE } from "../reducers/nav";

export const toggleDrawerOpen = open => {
  return {
    type: TOGGLE_DRAWER,
    payload: { open }
  };
};

export const toggleCollapseActive = stateName => {
  return {
    type: TOGGLE_COLLAPSE,
    payload: { stateName }
  };
};
