import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"
import { useError } from '../error/useError';

export const useGetSessions = (userId: number)=> {
    const { onError } = useError();

    return useQuery({
        queryKey: ['getSessions', userId],
        queryFn: ()=>SessionService.getByUserId(userId),
        onSuccess: (data)=>console.log(data),
        staleTime: 1000*60*2,
        onError
    })
}