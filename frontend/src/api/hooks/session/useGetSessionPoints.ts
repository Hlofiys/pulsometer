import { useQuery } from "@tanstack/react-query";
import SessionService from "../../../services/session/Session.service";
import { useError } from "../error/useError";

export const useGetSessionKeypoints = (sessionId?: string) => {
  const { onError } = useError();

  return useQuery({
    queryKey: ["getSessionKeypoints"],
    queryFn: () => SessionService.getKeypoints(+sessionId!),
    staleTime: 1000 * 60 * 1,
    enabled: !!sessionId,
    onError,
  });
};
