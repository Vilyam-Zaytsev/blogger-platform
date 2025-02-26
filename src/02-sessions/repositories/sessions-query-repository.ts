import {sessionsCollection} from "../../db/mongoDb";
import {WithId} from "mongodb";
import {SessionDbType} from "../types/session-db-type";
import {DeviceViewModel} from "../../03_devices/types/input-output-types";

const sessionsQueryRepository = {

    async findSessionsByUserId(userId: string): Promise<DeviceViewModel[]> {

        const sessions: WithId<SessionDbType>[] | null = await sessionsCollection
            .find({userId})
            .toArray();

        return sessions.map(s => this._mapSessionDbTypeToDeviceViewModel(s))
    },

    _mapSessionDbTypeToDeviceViewModel(session: WithId<SessionDbType>): DeviceViewModel {

        return {
            ip: session.ip,
            title: session.deviceName,
            lastActiveDate: session.iat.toISOString(),
            deviceId: session.deviceId
        };
    }
}

export {sessionsQueryRepository};