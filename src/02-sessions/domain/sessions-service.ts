import {SessionDbType} from "../types/session-db-type";
import {sessionsRepository} from "../sessions-repository";
import {SuccessResult} from "../../common/helpers/result-object";

const sessionsService = {

    async createSession(sessionParams: SessionDbType) {

        const resultInsertSession = await sessionsRepository
            .insertSession(sessionParams);

        return SuccessResult
            .create<string>(String(resultInsertSession.insertedId));
    },

    async deleteSession(id: string) {

        return await sessionsRepository
            .deleteSession(id);
    }
}

export {sessionsService};