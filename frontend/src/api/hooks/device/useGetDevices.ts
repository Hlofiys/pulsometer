import { useQuery } from "@tanstack/react-query";
import DeviceService from "../../../services/device/Device.service";
import { useDispatch } from "react-redux";
import { setDevices } from "../../../reduxToolkit/Slices";

export const useGetDevices = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["getDevices"],
    queryFn: DeviceService.getAll,
    onSuccess: (data) => {
      console.log(data.data);
      dispatch(setDevices(data.data));
    },
    staleTime: 1000 * 60 * 5,
  });
};
