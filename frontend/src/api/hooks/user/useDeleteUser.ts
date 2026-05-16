import { useMutation, useQueryClient } from "@tanstack/react-query";
import UserService from "../../../services/user/User.service";
import { useError } from "../error/useError";

export const useDeleteUser = (deviceId?: number) => {
  const queryClient = useQueryClient();
  const { onError } = useError();

  return useMutation({
    mutationKey: ["deleteUser"],
    mutationFn: UserService.delete,
    onSuccess: async () => {
      !!deviceId
        ? await queryClient.invalidateQueries({ queryKey: ["getUsersByDeviceId", deviceId] })
        : await queryClient.invalidateQueries({ queryKey: ["getUsers"] });
    },
    onError,
  });
};
