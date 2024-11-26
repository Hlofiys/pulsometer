import { instance } from "../../axios";
import {
  IUser,
  TCreateUser,
  TUpdateUser,
} from "../interfaces/Interfaces";

class UserService {
  async getAll() {
    return await instance.get<IUser[]>("/users");
  }

  async getById(userId: number) {
    return await instance.get<IUser>(`/users/${userId}`);
  }

  async create(data: TCreateUser) {
    return await instance.post("/users", data);
  }

  async delete(userId: number) {
    return await instance.delete(`/users/${userId}`);
  }

  async update(data: TUpdateUser) {
    const { userId, deviceId, fio } = data;
    return await instance.patch(`/users/${userId}`, {
      deviceId,
      fio,
    });
  }
}

export default new UserService();
