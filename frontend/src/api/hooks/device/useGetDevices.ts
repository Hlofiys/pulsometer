import { useQuery } from "@tanstack/react-query";
import DeviceService from "../../../services/device/Device.service";

export const useGetDevices = () => {

  return useQuery({
    queryKey: ["getDevices"],
    queryFn: DeviceService.getAll,
    staleTime: 1000 * 60 * 5,
  });
};
