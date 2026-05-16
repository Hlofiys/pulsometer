import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"
import { useError } from '../error/useError';
import { AxiosError } from "axios";

export const useGetSessions = (userId: number)=> {
    const { onError } = useError();

    return useQuery({
        queryKey: ['getSessions', userId],
        queryFn: async ()=>{
            try {
                return await SessionService.getByUserId(userId);
            } catch (error) {
                await onError(error as AxiosError);
                throw error;
            }
        },
        staleTime: 1000*60*1,
    })
}