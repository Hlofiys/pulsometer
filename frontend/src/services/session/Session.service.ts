import { instance } from "../../axios";
import { IMeasurements, ISession } from "../interfaces/Interfaces";

class SessionService {
  async getByUserId(userId: number) {
    const sessions = await instance.get<ISession[]>(
      `/users/${userId}/sessions`
    );
    return sessions.data;
  }

  async getMeasurements(sessionId: number) {
    const measurements = await instance.get<IMeasurements[]>(
      `/users/${sessionId}/measurements`
    );
    return measurements.data;
  }

  async getBySessionId(sessionId:number){
    return instance.get<ISession>(`/users/${sessionId}/sessions/info`);
  } 
}

export default new SessionService();
