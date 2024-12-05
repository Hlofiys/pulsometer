import { useMemo } from "react";
import { useGetDevices } from "./useGetDevices";

export const useGetDeviceOptions = () => {
    const { data: devices, isLoading: isLoadingDevices } = useGetDevices();

    const devicesOptions = useMemo(() => {
      return (
        (devices?.data || []).map((device) => ({
          label: `Пульсометр #${device.deviceId}`,
          value: device.deviceId,
        })) || []
      );
    }, [devices]);

    return {devicesOptions, isLoadingDevices, devices: devices?.data};
}