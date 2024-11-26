import { instance } from "../../axios";
import { IMeasurements, ISession } from "../interfaces/Interfaces";

class SessionService{
    async getByUserId(userId:number){
        return instance.get<ISession[]>(`/users/${userId}/sessions`)
    }

    async getMeasurements(sessionId: number){
        return instance.get<IMeasurements[]>(`/users/${sessionId}/measurements`)
    }
}

export default new SessionService();