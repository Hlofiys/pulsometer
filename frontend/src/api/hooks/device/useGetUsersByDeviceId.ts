import { useQuery } from "@tanstack/react-query";
import DeviceService from "../../../services/device/Device.service";
import { useError } from "../error/useError";
import { AxiosError } from "axios";

export const useGetUsersByDeviceId = (deviceId?: number) => {
  const { onError } = useError();

  return useQuery({
    queryKey: ["getUsersByDeviceId", deviceId],
    queryFn: async () => {
      try {
        return await DeviceService.getUsers(deviceId!);
      } catch (error) {
        await onError(error as AxiosError);
        throw error;
      }
    },
    enabled: !!deviceId,
    staleTime: 1000 * 60 * 5,
  });
};
