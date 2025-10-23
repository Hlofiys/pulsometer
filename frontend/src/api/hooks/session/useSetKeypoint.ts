import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useError } from "../error/useError";
import SessionService from "../../../services/session/Session.service";

export const useSetKeypoint = () => {
  const queryClient = useQueryClient();
  const { onError } = useError();

  return useMutation({
    mutationKey: ["setKeypoint"],
    mutationFn: SessionService.setKeypoint,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["getSessionKeypoints"]);
    },
    onError,
  });
};
