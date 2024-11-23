import { useMutation, useQueryClient } from "@tanstack/react-query"
import UserService from "../../../services/user/User.service"

export const useDeleteUser = () => {

    const queryClient = useQueryClient();
    
    return useMutation({
        mutationKey: ['deleteUser'],
        mutationFn: UserService.delete,
        onSuccess: async ()=>{
            await queryClient.invalidateQueries(['getUsers'])
            console.log('Success delete!')
        }
    })
}