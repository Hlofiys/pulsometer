import { useMutation } from "@tanstack/react-query"
import DeviceService from "../../../services/device/Device.service"

export const useActivateMeasurements = () => {
    return useMutation({
        mutationKey: ['activateMeasurements'],
        mutationFn: DeviceService.activateMeasurements,
        onSuccess:()=>console.log('Success activate!')
        // onError
    })
}