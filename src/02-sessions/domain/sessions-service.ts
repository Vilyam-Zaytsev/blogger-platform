import {SessionsRepository} from "../repositories/sessions-repository";
import {
    ForbiddenResult,
    InternalServerErrorResult,
    NotFoundResult,
    SuccessResult
} from "../../common/helpers/result-object";
import {ResultType} from "../../common/types/result-types/result-type";
import {ObjectId, WithId} from "mongodb";
import {sessionsCollection} from "../../db/mongoDb";
import {injectable} from "inversify";
import {Session} from "./session.entity";

@injectable()
class SessionsService {

    constructor(private sessionsRepository: SessionsRepository) {}

    async createSession(newSession: Session) {

        const resultInsertSession = await this.sessionsRepository
            .insertSession(newSession);

        return SuccessResult
            .create<string>(String(resultInsertSession.insertedId));
    }

    async deleteSession(id: string) {

        return await this.sessionsRepository
            .deleteSession(id);
    }

    async deleteSessionByDeviceId(userId: string, deviceId: ObjectId): Promise<ResultType> {

        const activeSession: WithId<Session> | null = await this.sessionsRepository
            .findSessionByDeviceId(deviceId)

        if (!activeSession) {

            return NotFoundResult
                .create(
                    'deviceId',
                    'No active session found with this deviceId.',
                    'Failed to delete the session.'
                );
        }

        if (activeSession.userId !== userId) {

            return ForbiddenResult
                .create(
                    'userId',
                    'The user does not have permission to delete this session.',
                    'Failed to delete the session.'
                );
        }

        const resultDeleteActiveSession: boolean = await this.sessionsRepository
            .deleteSession(String(activeSession._id));

        if (!resultDeleteActiveSession) {

            return InternalServerErrorResult
                .create(
                    'no field',
                    'Server Error.',
                    'Failed to delete the session.'
                );
        }

        return SuccessResult
            .create(null);
    }

    async deleteAllSessionsExceptCurrent(userId: string, deviceId: ObjectId): Promise<boolean> {

        return await this.sessionsRepository
            .deleteAllSessionsExceptCurrent(userId, deviceId);
    }
}

export {SessionsService};