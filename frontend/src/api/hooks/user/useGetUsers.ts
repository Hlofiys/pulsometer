import { useQuery } from "@tanstack/react-query";
import UserService from "../../../services/user/User.service";
import { useError } from "../error/useError";
import { AxiosError } from "axios";

export const useGetUsers = (enabled?: boolean) => {
  const { onError } = useError();

  return useQuery({
    queryKey: ["getUsers"],
    queryFn: async () => {
      try {
        return await UserService.getAll();
      } catch (error) {
        await onError(error as AxiosError);
        throw error;
      }
    },
    // staleTime: 1000 * 60 * 5,
    enabled,
  });
};
