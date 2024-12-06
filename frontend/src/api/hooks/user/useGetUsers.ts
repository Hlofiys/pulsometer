import { useQuery } from "@tanstack/react-query";
import UserService from "../../../services/user/User.service";
import { useDispatch } from "react-redux";
import { setUsers } from "../../../reduxToolkit/Slices";
import { useError } from "../error/useError";

export const useGetUsers = (enabled?: boolean) => {
  const dispatch = useDispatch();
  const { onError } = useError();

  return useQuery({
    queryKey: ["getUsers"],
    queryFn: UserService.getAll,
    onSuccess: (data) => {
      console.log(data.data);
      dispatch(setUsers(data.data));
    },
    // staleTime: 1000 * 60 * 5,
    enabled,
    onError,
  });
};
