import {sessionsCollection} from "../db/mongoDb";
import {InsertOneResult, WithId} from "mongodb";
import {SessionModel} from "./types/session-model";

const sessionsRepository = {

    async insertSession(newSession: SessionModel): Promise<InsertOneResult> {

        return await sessionsCollection
            .insertOne(newSession);
    },

    async findSession(iat: Date, deviceId: string): Promise<WithId<SessionModel> | null> {

        return sessionsCollection
            .findOne({iat, deviceId});
    }
}

export {sessionsRepository};