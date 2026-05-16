import { useQuery } from "@tanstack/react-query";
import SessionService from "../../../services/session/Session.service";
import { useError } from "../error/useError";
import { AxiosError } from "axios";

export const useGetSessionKeypoints = (sessionId?: string) => {
  const { onError } = useError();

  return useQuery({
    queryKey: ["getSessionKeypoints", sessionId],
    queryFn: async () => {
      try {
        return await SessionService.getKeypoints(+(sessionId || 0));
      } catch (error) {
        await onError(error as AxiosError);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 1,
    enabled: !!sessionId,
  });
};
