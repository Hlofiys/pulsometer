import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"
import { useError } from '../error/useError';
import { AxiosError } from "axios";

export const useGetSessionById = (sessionId: number)=> {
    const { onError } = useError();

    return useQuery({
        queryKey: ['getSessionById', sessionId],
        queryFn: async ()=>{
            try {
                return await SessionService.getBySessionId(sessionId);
            } catch (error) {
                await onError(error as AxiosError);
                throw error;
            }
        },
        staleTime: 1000*60*2,
    })
}