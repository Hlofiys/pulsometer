import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"
import { useError } from '../error/useError';

export const useGetMeasurementsById = (userId?: number)=>{
    const { onError } = useError();

    return useQuery({
        queryKey: ['getMeasurements'],
        queryFn: ()=>SessionService.getMeasurements(userId!),
        onSuccess:(data)=>data,
        enabled: !!userId,
        onError
    })
}