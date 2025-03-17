import {WithId} from "mongodb";
import {DeviceViewModel} from "../types/input-output-types";
import {injectable} from "inversify";
import {Session} from "../domain/session-entity";
import {SessionModel} from "../../db/mongo-db/models/session-model";

@injectable()
class SessionsQueryRepository {

    async findSessionsByUserId(userId: string): Promise<DeviceViewModel[]> {

        const sessions: WithId<Session>[] | null = await SessionModel
            .find({userId})

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