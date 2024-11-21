import { instance } from "../../axios";
import { IDevice, IUser, TSwitchDeviceStatus } from "../interfaces/Interfaces";

class DeviceServices {
  async getAll() {
    return await instance.get<IDevice[]>("/devices");
  }

  async getUsers(deviceId: number) {
    return instance.get<IUser[]>(`/devices/${deviceId}/users`);
  }

  async switchActiveUser(props: TSwitchDeviceStatus) {
    const { id: deviceId, activeUserId, status } = props;
    return instance.patch(`/device`, {
      deviceId,
      activeUserId,
      status,
    });
  }
}

export default new DeviceServices();
