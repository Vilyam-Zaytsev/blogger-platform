import {ResultType} from "../../common/types/result-types/result-type";
import {SessionModel} from "../types/session-model";
import {sessionsRepository} from "../sessions-repository";
import {BadRequestResult, SuccessResult} from "../../common/helpers/result-object";
import {WithId} from "mongodb";

const sessionsService = {

    async createSession(sessionParams: SessionModel) {

        const resultInsertSession = await sessionsRepository
            .insertSession(sessionParams);

        return SuccessResult
            .create<string>(String(resultInsertSession.insertedId));
    },

    async isSessionActive(iat: Date, deviceId: string): ResultType<string | null> {

        const session: WithId<SessionModel> | null = await sessionsRepository
            .findSession(iat, deviceId);

        if (!session) {

            return BadRequestResult
                .create(
                    'versionToken',
                    'There is no such session.',
                    'The session was not found.'
                );
        }

        return SuccessResult
            .create<string>(String(session._id));
    }
}

export {sessionsService};