import { instance } from "../../axios";
import {
  IDevice,
  IUser,
  TActivateMeasurements,
} from "../interfaces/Interfaces";

class DeviceServices {
  async getAll() {
    return await instance.get<IDevice[]>("/devices");
  }

  async getUsers(deviceId: number) {
    return await instance.get<IUser[]>(`/devices/${deviceId}/users`);
  }

  async activateMeasurements(props: TActivateMeasurements) {
    const { activeUserId } = props;
    return instance.post(
      `/devices/activate?activeUserId=${activeUserId}`
      // {},
      // {
        // params: activeUserId,
        // paramsSerializer: {
        //   indexes: false, // empty brackets like `arrayOfUserIds[]`
        // },
      // }
    );
  }

  async deactivateMeasurements(activeUserId: number) {
    return await instance.post(`/devices/activate/${activeUserId}`);
  }
}

export default new DeviceServices();
