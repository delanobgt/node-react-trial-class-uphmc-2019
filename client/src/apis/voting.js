import axios from "axios";

export default config => {
  return axios.create({
    ...config,
    baseURL: `${process.env.REACT_APP_API_BASE_URL ||
      window.location.origin}/api`,
    headers: { authorization: localStorage.getItem("authToken") || "" }
  });
};
