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
    const { activeUserId, deviceId } = props;
    return instance.post(
      `/devices/activate/${deviceId}?activeUserId=${activeUserId}`
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
