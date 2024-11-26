import { useMutation } from "@tanstack/react-query"
import DeviceService from "../../../services/device/Device.service"

export const useDeactivateMeasurements = () => {
    return useMutation({
        mutationKey: ['deactivateMeasurements'],
        mutationFn: DeviceService.deactivateMeasurements,
        onSuccess:()=>console.log('Success deactivate!')
        // onError
    })
}