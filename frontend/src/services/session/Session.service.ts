import { instance } from "../../axios";
import {
  IMeasurements,
  ISession,
  ISessionPoint,
} from "../interfaces/Interfaces";

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

  async getBySessionId(sessionId: number) {
    return instance.get<ISession>(`/users/${sessionId}/sessions/info`);
  }

  async getKeypoints(sessionId: number) {
    return instance.get<ISessionPoint[]>(`/users/${sessionId}/keypoints`);
  }
  async setKeypoint(data: Omit<ISessionPoint, "keyPointId">) {
    const { sessionId, ...body } = data;
    return instance.post<ISessionPoint[]>(
      `/users/${sessionId}/keypoints`,
      body
    );
  }

  async deleteKeypoint(keypointId: number) {
    return instance.delete(`/users/keypoints/${keypointId}`);
  }
}

export default new SessionService();
