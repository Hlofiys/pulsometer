import axios from "axios";

export const instance = axios.create({
  baseURL: "http://home.hlofiys.xyz:8000/api",
});
