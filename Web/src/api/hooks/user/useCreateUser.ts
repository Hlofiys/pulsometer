import { useMutation, useQueryClient } from "@tanstack/react-query"
import UserService from "../../../services/user/User.service"

export const useCreateUser = () => {

    const queryClient = useQueryClient();
    
    return useMutation({
        mutationKey: ['createUser'],
        mutationFn: UserService.create,
        onSuccess:async ()=>{
            await queryClient.invalidateQueries(['getUsers'])
            console.log('Success create!')
        },
    })
}