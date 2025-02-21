import {sessionsCollection} from "../db/mongoDb";
import {WithId} from "mongodb";
import {SessionModel} from "./types/session-model";

const sessionsRepository = {

    async findSession(iat: Date, deviceId: string): Promise<WithId<SessionModel> | null> {

        return sessionsCollection
            .findOne({iat, deviceId});
    }
}

export {sessionsRepository};