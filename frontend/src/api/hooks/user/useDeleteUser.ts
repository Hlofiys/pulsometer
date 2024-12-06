import { useMutation, useQueryClient } from "@tanstack/react-query"
import UserService from "../../../services/user/User.service"
import { useError } from '../error/useError';

export const useDeleteUser = () => {

    const queryClient = useQueryClient();
    const { onError } = useError();
    
    return useMutation({
        mutationKey: ['deleteUser'],
        mutationFn: UserService.delete,
        onSuccess: async ()=>{
            await queryClient.invalidateQueries(['getUsers'])
            console.log('Success delete!')
        },
        onError
    })
}