import { useQuery } from "@tanstack/react-query";
import UserService from "../../../services/user/User.service";
import { useError } from '../error/useError';
import { AxiosError } from "axios";

export const useGetUserById = (userId: number, enabled?: boolean) => {
  const { onError } = useError();

  return useQuery({
    queryKey: ["getUserById", userId],
    queryFn: async () => {
      try {
        return await UserService.getById(userId!);
      } catch (error) {
        await onError(error as AxiosError);
        throw error;
      }
    },
    enabled: !!userId || enabled,
    staleTime: 1000*60*2,
  });
};
