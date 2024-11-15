import { instance } from "../../axios";
import { IDevice, IUser } from "../interfaces/Interfaces";

class DeviceServices {
  async getAll() {
    return await instance.get<IDevice[]>("/devices");
  }

  async getUsers(deviceId: number) {
    return instance.get<IUser[]>(`/devices/${deviceId}/users`);
  }

  async switchActiveUser(deviceId: number, userId?: number) {
    /* 
        поле deviceId - обязательное, поле userId - необязательное 
        (с ним устройство меняет активного пользователя, 
        без него - меняет свой статус (вкл/выкл))
    */
    return instance.patch(`/device/${deviceId}`, { data: { userId } });
  }
}

export default new DeviceServices();
