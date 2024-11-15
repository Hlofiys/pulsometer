import { instance } from "../../axios";
import { IMeasurements, IUser, TCreateUser, TUpdateUser } from "../interfaces/Interfaces";

class UserService {
  async getAll() {
    return await instance.get<IUser[]>("/users");
  }

  async getById(userId: number) {
    return await instance.get<IUser>(`/users/${userId}`);
  }

  async create(data: TCreateUser) {
    return await instance.post("/users", { data: data });
  }

  async delete(userId: number) {
    return await instance.delete(`/users/${userId}`);
  }

  async update(data: TUpdateUser) {
    const { id: userId, deviceId, fio } = data;
    return await instance.patch(`/users/${userId}`, {
      data: {
        deviceId,
        fio,
      },
    });
  }

  async getMeasurementsById(userId: number) {
    return await instance.get<IMeasurements[]>(`/users/${userId}/measurements`);
  }
}

export default new UserService();
