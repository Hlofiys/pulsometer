import { useMutation } from "@tanstack/react-query"
import DeviceService from "../../../services/device/Device.service"
import { useError } from '../error/useError'
import { RouterPath } from '../../../router/Router';
import { useNavigate } from 'react-router-dom';

export const useActivateMeasurements = () => {
    const { onError } = useError(); 
    const nav = useNavigate();
    return useMutation({
        mutationKey: ['activateMeasurements'],
        mutationFn: DeviceService.activateMeasurements,
        onSuccess:({data})=>{
            console.log('Success activate!')
            data && nav(RouterPath.PROCESS_SESSION+`/${data}`)
        },
        onError
    })
}