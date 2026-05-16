import { useQuery } from "@tanstack/react-query"
import SessionService from "../../../services/session/Session.service"
import { useError } from '../error/useError';
import { AxiosError } from "axios";

export const useGetMeasurementsById = (userId?: number)=>{
    const { onError } = useError();

    return useQuery({
        queryKey: ['getMeasurements', userId],
        queryFn: async ()=>{
            try {
                return await SessionService.getMeasurements(userId!);
            } catch (error) {
                await onError(error as AxiosError);
                throw error;
            }
        },
        enabled: !!userId,
    })
}