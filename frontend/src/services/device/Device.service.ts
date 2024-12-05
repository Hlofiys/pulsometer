import { instance } from "../../axios";
import {
  IDevice,
  IUser,
  TActivateMeasurements,
} from "../interfaces/Interfaces";

export enum DeviceStatus {
  "off" = "Отключено",
  "ready" = "Подключено",
  "measuring" = "В процессе измерения",
}

class DeviceServices {
  async getAll() {
    return await instance.get<IDevice[]>("/devices");
  }

  async getUsers(deviceId: number) {
    return await instance.get<IUser[]>(`/devices/${deviceId}/users`);
  }

  async activateMeasurements(props: TActivateMeasurements) {
    const { userId, typeActivity } = props;
    return instance.post(
      `/devices/activate`,
      {},
      {
        params: {
          activeUserId: userId,
          typeActivity,
        },
      }
    );
  }

  async deactivateMeasurements(activeUserId: number) {
    return await instance.post(
      `/devices/deactivate`,
      {},
      { params: { activeUserId } }
    );
  }
}

export default new DeviceServices();
