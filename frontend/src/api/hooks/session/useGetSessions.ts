import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"

export const useGetSessions = (userId: number)=> {
    return useQuery({
        queryKey: ['getSessions', userId],
        queryFn: ()=>SessionService.getByUserId(userId),
        onSuccess: (data)=>console.log(data),
        staleTime: 1000*60*2
    })
}