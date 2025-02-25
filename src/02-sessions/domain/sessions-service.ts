import {SessionDbType} from "../types/session-db-type";
import {sessionsRepository} from "../repositoryes/sessions-repository";
import {InternalServerErrorResult, SuccessResult} from "../../common/helpers/result-object";
import {ResultType} from "../../common/types/result-types/result-type";

const sessionsService = {

    async createSession(newSession: SessionDbType) {

        const resultInsertSession = await sessionsRepository
            .insertSession(newSession);

        return SuccessResult
            .create<string>(String(resultInsertSession.insertedId));
    },

    async deleteSession(id: string) {

        return await sessionsRepository
            .deleteSession(id);
    },

    async deleteSessionByUserIdAndDeviceId(userId: string, deviceId: string): Promise<boolean> {

        return await sessionsRepository
            .deleteSessionByUserIdAndDeviceId(userId, deviceId);
    },

    async deleteAllSessionsExceptCurrent(userId: string, iat: Date): Promise<boolean> {

        return await sessionsRepository
            .deleteAllSessionsExceptCurrent(userId, iat);
    }
}

export {sessionsService};