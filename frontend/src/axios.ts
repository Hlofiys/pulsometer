import axios from "axios";

export const instance = axios.create({
  baseURL: "https://pulse.hlofiys.xyz/api/",
});
