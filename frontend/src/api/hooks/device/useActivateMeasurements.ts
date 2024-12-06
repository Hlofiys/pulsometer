import { useMutation } from "@tanstack/react-query"
import DeviceService from "../../../services/device/Device.service"
import { useError } from '../error/useError'

export const useActivateMeasurements = () => {
    const { onError } = useError(); 
    return useMutation({
        mutationKey: ['activateMeasurements'],
        mutationFn: DeviceService.activateMeasurements,
        onSuccess:()=>console.log('Success activate!'),
        onError
    })
}