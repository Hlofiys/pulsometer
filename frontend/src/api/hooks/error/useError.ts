import { message } from "antd";
import { AxiosError } from "axios";

export const useError = () => {
  return {
    onError: async (error: AxiosError) => {
      return message.error(`${error.message}`);
    },
  };
};
