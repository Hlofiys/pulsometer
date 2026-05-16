import { useMutation, useQueryClient } from "@tanstack/react-query"
import UserService from "../../../services/user/User.service"
import { useError } from '../error/useError';

export const useCreateUser = () => {

    const queryClient = useQueryClient();
    const { onError } = useError();
    
    return useMutation({
        mutationKey: ['createUser'],
        mutationFn: UserService.create,
        onSuccess:async ()=>{
            await queryClient.invalidateQueries({ queryKey: ['getUsers'] })
        },
        onError
    })
}