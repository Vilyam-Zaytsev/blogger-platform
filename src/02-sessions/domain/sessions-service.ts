import {ActiveSessionType} from "../types/active-session-type";
import {sessionsRepository} from "../repositories/sessions-repository";
import {
    ForbiddenResult,
    InternalServerErrorResult,
    NotFoundResult,
    SuccessResult
} from "../../common/helpers/result-object";
import {ResultType} from "../../common/types/result-types/result-type";
import {WithId} from "mongodb";

const sessionsService = {

    async createSession(newSession: ActiveSessionType) {

        const resultInsertSession = await sessionsRepository
            .insertSession(newSession);

        return SuccessResult
            .create<string>(String(resultInsertSession.insertedId));
    },

    async deleteSession(id: string) {

        return await sessionsRepository
            .deleteSession(id);
    },

    async deleteSessionByDeviceId(userId: string, deviceId: string): Promise<ResultType> {

        const activeSession: WithId<ActiveSessionType> | null = await sessionsRepository
            .findSessionByDeviceId(deviceId);

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

        const resultDeleteActiveSession: boolean = await sessionsRepository
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
    },

    async deleteAllSessionsExceptCurrent(userId: string, iat: string): Promise<boolean> {

        return await sessionsRepository
            .deleteAllSessionsExceptCurrent(userId, iat);
    }
}

export {sessionsService};