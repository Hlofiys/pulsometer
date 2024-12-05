import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"

export const useGetSessionById = (sessionId: number)=> {
    return useQuery({
        queryKey: ['getSessionById', sessionId],
        queryFn: ()=>SessionService.getBySessionId(sessionId),
        onSuccess: (data)=>console.log(data),
        staleTime: 1000*60*2
    })
}