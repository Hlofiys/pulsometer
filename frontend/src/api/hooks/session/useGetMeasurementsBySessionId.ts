import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"
import { useError } from '../error/useError';
import { AxiosError } from "axios";

export const useGetMeasurementsBySessionId = (sessionId: number)=> {
    const { onError } = useError();
    return useQuery({
        queryKey: ['getMeasurementsBySessionId', sessionId],
        queryFn: async ()=>{
            try {
                return await SessionService.getMeasurements(sessionId);
            } catch (error) {
                await onError(error as AxiosError);
                throw error;
            }
        },
        staleTime: 1000*60*2,
    })
}