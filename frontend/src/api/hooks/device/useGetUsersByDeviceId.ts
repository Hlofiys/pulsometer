import { useQuery } from "@tanstack/react-query";
import DeviceService from "../../../services/device/Device.service";

export const useGetUsersByDeviceId = (deviceId?: number) => {
  return useQuery({
    queryKey: ["getUsersByDeviceId", deviceId],
    queryFn: () => DeviceService.getUsers(deviceId!),
    onSuccess: (data) => console.log(data.data),
    enabled: !!deviceId,
    staleTime: 1000*60*5
  });
};
