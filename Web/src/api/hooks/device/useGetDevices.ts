import { useQuery } from "@tanstack/react-query";
import DeviceService from "../../../services/device/Device.service";

export const useGetDevices = () => {

  return useQuery({
    queryKey: ["getDevices"],
    queryFn: DeviceService.getAll,
    onSuccess: (data) => {
      console.log(data.data);
    },
    staleTime: 1000 * 60 * 5,
  });
};
