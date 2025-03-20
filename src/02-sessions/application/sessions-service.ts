import {SessionsRepository} from "../repositories/sessions-repository";
import {
    ForbiddenResult,
    InternalServerErrorResult,
    NotFoundResult,
    SuccessResult
} from "../../common/helpers/result-object";
import {ResultType} from "../../common/types/result-types/result-type";
import {ObjectId, WithId} from "mongodb";
import {injectable} from "inversify";
import {Session} from "../domain/session-entity";
import {SessionDocument, SessionModel} from "../../db/mongo-db/models/session-model";

@injectable()
class SessionsService {

    constructor(private sessionsRepository: SessionsRepository) {}

    async createSession(sessionDto: Session): Promise<ResultType<string | null>> {

        const newSession: SessionDocument = new SessionModel(sessionDto);

        const resultSaveSession: SessionDocument = await this.sessionsRepository
            .saveSession(newSession);

        if (!resultSaveSession) {

            return InternalServerErrorResult
                .create(
                    'not field',
                    'Couldn\'t save the session.',
                    'Failed to create a session.'
                )
        }

        return SuccessResult
            .create<string>(String(resultSaveSession._id));
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