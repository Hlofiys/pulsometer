import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useError } from "../error/useError";
import SessionService from "../../../services/session/Session.service";

export const useDeleteKeypoint = () => {
  const queryClient = useQueryClient();
  const { onError } = useError();

  return useMutation({
    mutationKey: ["deleteKeypoint"],
    mutationFn: SessionService.deleteKeypoint,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["getSessionKeypoints"]);
    },
    onError,
  });
};
