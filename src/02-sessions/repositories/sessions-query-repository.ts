import {WithId} from "mongodb";
import {DeviceViewModel} from "../types/input-output-types";
import {injectable} from "inversify";
import {Session} from "../domain/session-entity";
import {SessionDocument, SessionModel} from "../../archive/models/session-model";

@injectable()
class SessionsQueryRepository {

    async findSessionsByUserId(userId: string): Promise<DeviceViewModel[]> {

        const sessions: SessionDocument[] = await SessionModel
            .find({userId})
            .exec();

        return sessions.map(s => this._mapSessionDbTypeToDeviceViewModel(s))
    }

    _mapSessionDbTypeToDeviceViewModel(session: SessionDocument): DeviceViewModel {

        return {
            ip: session.ip,
            title: session.deviceName,
            lastActiveDate: session.iat,
            deviceId: String(session.deviceId)
        };
    }
}

export {SessionsQueryRepository};