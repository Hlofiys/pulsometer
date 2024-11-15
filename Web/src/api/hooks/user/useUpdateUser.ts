import { useMutation } from "@tanstack/react-query"
import UserService from "../../../services/user/User.service"

export const useUpdateUser = () => {
    return useMutation({
        mutationKey:['updateUser'],
        mutationFn: UserService.update,
        onSuccess: ()=>console.log('Success update!')
    })

}