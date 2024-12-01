import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"

export const useGetMeasurementsBySessionId = (sessionId: number)=> {
    return useQuery({
        queryKey: ['getMeasurementsBySessionId', sessionId],
        queryFn: ()=>SessionService.getMeasurements(sessionId),
        onSuccess: (data)=>console.log(data),
        staleTime: 1000*60*2
    })
}