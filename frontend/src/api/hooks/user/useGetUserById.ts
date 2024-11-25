import { useQuery } from "@tanstack/react-query";
import UserService from "../../../services/user/User.service";

export const useGetUserById = (userId: number) => {
  return useQuery({
    queryKey: ["getUserById"],
    queryFn: () => UserService.getById(userId!),
    onSuccess: (data) => console.log(data.data),
    enabled: !!userId,
  });
};
