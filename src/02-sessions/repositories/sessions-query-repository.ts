import {sessionsCollection} from "../../db/mongoDb";
import {WithId} from "mongodb";
import {DeviceViewModel} from "../types/input-output-types";
import {injectable} from "inversify";
import {Session} from "../domain/session.entity";

@injectable()
class SessionsQueryRepository {

    async findSessionsByUserId(userId: string): Promise<DeviceViewModel[]> {

        const sessions: WithId<Session>[] | null = await sessionsCollection
            .find({userId})
            .toArray();

        return sessions.map(s => this._mapSessionDbTypeToDeviceViewModel(s))
    }

    _mapSessionDbTypeToDeviceViewModel(session: WithId<Session>): DeviceViewModel {

        return {
            ip: session.ip,
            title: session.deviceName,
            lastActiveDate: session.iat,
            deviceId: String(session.deviceId)
        };
    }
}

export {SessionsQueryRepository};