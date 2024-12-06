import { useMutation } from "@tanstack/react-query"
import DeviceService from "../../../services/device/Device.service"
import { useError } from '../error/useError';

export const useDeactivateMeasurements = () => {
    const { onError } = useError(); 
    return useMutation({
        mutationKey: ['deactivateMeasurements'],
        mutationFn: DeviceService.deactivateMeasurements,
        onSuccess:()=>console.log('Success deactivate!'),
        onError
    })
}