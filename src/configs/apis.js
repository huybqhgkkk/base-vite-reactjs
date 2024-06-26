import axios from "axios";
import { settings } from ".";

const apis = {
  getPost() {
    return axios.get(
      `${settings.ServiceAddress}`
    );
  },
  // searchResult(payload) {
  //   return axios.post(`${settings.ServiceAddress}otp/send-checking`, payload);
  // },
};

export default apis;
