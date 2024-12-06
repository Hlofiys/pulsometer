import { useQuery } from "@tanstack/react-query";
import DeviceService from "../../../services/device/Device.service";
import { useError } from "../error/useError";

export const useGetUsersByDeviceId = (deviceId?: number) => {
  const { onError } = useError();

  return useQuery({
    queryKey: ["getUsersByDeviceId", deviceId],
    queryFn: () => DeviceService.getUsers(deviceId!),
    onSuccess: (data) => console.log(data.data),
    enabled: !!deviceId,
    staleTime: 1000 * 60 * 5,
    onError
  });
};
