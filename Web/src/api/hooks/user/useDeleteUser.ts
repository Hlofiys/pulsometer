import { useMutation } from "@tanstack/react-query"
import UserService from "../../../services/user/User.service"

export const useDeleteUser = () => {
    return useMutation({
        mutationKey: ['deleteUser'],
        mutationFn: UserService.delete,
        onSuccess:()=>console.log('Success delete!')
    })
}