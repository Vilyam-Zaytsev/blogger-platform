import {SessionsRepository} from "../repositories/sessions-repository";
import {InternalServerErrorResult, NotFoundResult, SuccessResult} from "../../common/helpers/result-object";
import {ResultType} from "../../common/types/result-types/result-type";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {SessionDto} from "../domain/session-dto";
import {SessionDocument, SessionModel} from "../domain/session-entity";

@injectable()
class SessionsService {

    constructor(private sessionsRepository: SessionsRepository) {}

    async createSession(dto: SessionDto): Promise<ResultType<string | null>> {

        const newSession: SessionDocument = SessionModel.createSession(dto);

        const resultSaveSession: string = await this.sessionsRepository
            .saveSession(newSession);

        return SuccessResult
            .create<string>(resultSaveSession);
    }


    async deleteSession(id: string) {

        return await this.sessionsRepository
            .deleteSession(id);
    }

    async deleteSessionByDeviceId(deviceId: ObjectId): Promise<ResultType> {

        const activeSession: SessionDocument | null = await this.sessionsRepository
            .findSessionByDeviceId(deviceId)

        if (!activeSession) {

            return NotFoundResult
                .create(
                    'deviceId',
                    'No active session found with this deviceId.',
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