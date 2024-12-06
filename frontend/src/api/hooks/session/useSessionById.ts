import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"
import { useError } from '../error/useError';

export const useGetSessionById = (sessionId: number)=> {
    const { onError } = useError();

    return useQuery({
        queryKey: ['getSessionById', sessionId],
        queryFn: ()=>SessionService.getBySessionId(sessionId),
        onSuccess: (data)=>console.log(data),
        staleTime: 1000*60*2,
        onError
    })
}