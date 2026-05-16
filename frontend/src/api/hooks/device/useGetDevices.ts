import { useQuery } from "@tanstack/react-query";
import DeviceService from "../../../services/device/Device.service";
import { useError } from "../error/useError";
import { AxiosError } from "axios";

export const useGetDevices = () => {
  const { onError } = useError();
  return useQuery({
    queryKey: ["getDevices"],
    queryFn: async () => {
      try {
        return await DeviceService.getAll();
      } catch (error) {
        await onError(error as AxiosError);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};
