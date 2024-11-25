import { useMutation, useQueryClient } from "@tanstack/react-query"
import UserService from "../../../services/user/User.service"

export const useUpdateUser = () => {
    // const {} = useErr
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey:['updateUser'],
        mutationFn: UserService.update,
        onSuccess: async ()=>{
            await queryClient.invalidateQueries(['getUsers'])
            console.log('Success update!')
        }
    })

}