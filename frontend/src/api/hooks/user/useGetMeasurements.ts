import { useQuery } from "@tanstack/react-query"
import UserService from "../../../services/user/User.service"

export const useGetMeasurementsById = (userId?: number)=>{
    return useQuery({
        queryKey: ['getMeasurements'],
        queryFn: ()=>UserService.getMeasurementsById(userId!),
        onSuccess:(data)=>data.data,
        enabled: !!userId
    })
}
UserService.getMeasurementsById