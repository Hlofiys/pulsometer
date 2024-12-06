import { useQuery } from "@tanstack/react-query";
import DeviceService from "../../../services/device/Device.service";
import { useError } from "../error/useError";

export const useGetDevices = () => {
  const { onError } = useError();
  return useQuery({
    queryKey: ["getDevices"],
    queryFn: DeviceService.getAll,
    staleTime: 1000 * 60 * 5,
    onError,
  });
};
