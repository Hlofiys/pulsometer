import { useMutation } from "@tanstack/react-query"
import UserService from "../../../services/user/User.service"

export const useCreateUser = () => {
    return useMutation({
        mutationKey: ['createUser'],
        mutationFn: UserService.create,
        onSuccess:()=>console.log('Success create!'),
    })
}