import "./fonts/index.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import reduxThunk from "redux-thunk";
import HttpsRedirect from "react-https-redirect";
import WebFont from "webfontloader";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import reducers from "./reducers";
import Router from "./components/Router";

WebFont.load({
  google: {
    families: ["Roboto:300,400,500", "Baloo Chettan:400", "sans-serif"]
  }
});

const theme = createMuiTheme({
  props: {}
});

const store = createStore(
  reducers,
  {
    auth: {
      token: localStorage.getItem("authToken"),
      expiresAt: Number(localStorage.getItem("expiresAt"))
    }
  },
  applyMiddleware(reduxThunk)
);

ReactDOM.render(
  <HttpsRedirect>
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <Router />
      </Provider>
    </MuiThemeProvider>
  </HttpsRedirect>,
  document.querySelector("#root")
);
