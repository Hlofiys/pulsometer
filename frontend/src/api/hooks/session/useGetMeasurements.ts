import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"

export const useGetMeasurements = (sessionId: number)=> {
    return useQuery({
        queryKey: ['getSessions', sessionId],
        queryFn: ()=>SessionService.getMeasurements(sessionId),
        onSuccess: (data)=>console.log(data.data),
        staleTime: 1000*60*2
    })
}