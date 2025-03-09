import {sessionsCollection} from "../../db/mongoDb";
import {WithId} from "mongodb";
import {ActiveSessionType} from "../types/active-session-type";
import {DeviceViewModel} from "../types/input-output-types";

class SessionsQueryRepository {

    async findSessionsByUserId(userId: string): Promise<DeviceViewModel[]> {

        const sessions: WithId<ActiveSessionType>[] | null = await sessionsCollection
            .find({userId})
            .toArray();

        return sessions.map(s => this._mapSessionDbTypeToDeviceViewModel(s))
    }

    _mapSessionDbTypeToDeviceViewModel(session: WithId<ActiveSessionType>): DeviceViewModel {

        return {
            ip: session.ip,
            title: session.deviceName,
            lastActiveDate: session.iat,
            deviceId: session.deviceId
        };
    }
}

const sessionsQueryRepository: SessionsQueryRepository = new SessionsQueryRepository();

export {sessionsQueryRepository};