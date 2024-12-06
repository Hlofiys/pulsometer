import { useQuery } from "@tanstack/react-query";
import UserService from "../../../services/user/User.service";
import { useError } from '../error/useError';

export const useGetUserById = (userId: number, enabled?: boolean) => {
  const { onError } = useError();

  return useQuery({
    queryKey: ["getUserById"],
    queryFn: () => UserService.getById(userId!),
    onSuccess: (data) => console.log(data.data),
    enabled: !!userId || enabled,
    onError
  });
};
