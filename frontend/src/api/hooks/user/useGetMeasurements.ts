import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"

export const useGetMeasurementsById = (userId?: number)=>{
    return useQuery({
        queryKey: ['getMeasurements'],
        queryFn: ()=>SessionService.getMeasurements(userId!),
        onSuccess:(data)=>data.data,
        enabled: !!userId
    })
}