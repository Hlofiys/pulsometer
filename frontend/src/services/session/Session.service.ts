import { instance } from "../../axios";
import { parseDateAndTime } from "../../utils/functions/functions";
import { IMeasurements, ISession } from "../interfaces/Interfaces";

class SessionService {
  async getByUserId(userId: number) {
    const sessions = await instance.get<ISession[]>(`/users/${userId}/sessions`);
    console.log(sessions.data.map(item=>parseDateAndTime(item.time).convertBY))
    return sessions.data.map((session) => ({
      ...session,
      time: parseDateAndTime(session.time).convertBY,
    //   passed: useBelarusTime(session.passed),
    }));
  }

  async getMeasurements(sessionId: number) {
    const measurements = await instance.get<IMeasurements[]>(
      `/users/${sessionId}/measurements`
    );
    return measurements.data.map((measurement) => ({
      ...measurement,
      date: parseDateAndTime(measurement.date).convertBY
    }));
  }
}

export default new SessionService();
