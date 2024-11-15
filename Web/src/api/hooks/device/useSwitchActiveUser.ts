import { useMutation } from "@tanstack/react-query";
import DeviceService from "../../../services/device/Device.service";

export const useSwitchActiveUser = () => {
  return useMutation({
    mutationKey: ["switchActiveUser"],
    mutationFn: DeviceService.switchActiveUser,
    onSuccess: () => console.log("Success switch!"),
  });
};
