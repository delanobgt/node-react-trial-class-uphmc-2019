export const AUTH_DYING_DIALOG = "AUTH_DYING_DIALOG";
export const AUTH_SIGN_IN = "AUTH_SIGN_IN";
export const AUTH_SIGN_OUT = "AUTH_SIGN_OUT";
export const SELF_EMAIL_UPDATE = "SELF_EMAIL_UPDATE";
export const SELF_PROFILE_GET = "SELF_PROFILE_GET";
export const SELF_CONNECTED_UPDATE = "SELF_CONNECTED_UPDATE";

const INITIAL_STATE = {
  token: "",
  expiresAt: null,
  id: "",
  email: "",
  role: "",
  banned: null,
  createdAt: null,
  connected: null,
  showDyingDialog: false
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case AUTH_DYING_DIALOG: {
      const { showDyingDialog } = action.payload;
      return {
        ...state,
        showDyingDialog
      };
    }
    case AUTH_SIGN_IN: {
      const { token, expiresAt } = action.payload;
      return {
        ...state,
        token,
        expiresAt
      };
    }
    case AUTH_SIGN_OUT: {
      return INITIAL_STATE;
    }
    case SELF_EMAIL_UPDATE: {
      const { email } = action.payload;
      return {
        ...state,
        email
      };
    }
    case SELF_PROFILE_GET: {
      const {
        _id: id,
        email,
        role,
        connected,
        banned,
        createdAt
      } = action.payload;
      return {
        ...state,
        id,
        email,
        role,
        banned,
        connected,
        createdAt
      };
    }
    case SELF_CONNECTED_UPDATE: {
      const { connected } = action.payload;
      return {
        ...state,
        connected
      };
    }
    default: {
      return state;
    }
  }
}
