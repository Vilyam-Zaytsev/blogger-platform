import {sessionsCollection} from "../db/mongoDb";
import {InsertOneResult, ObjectId, WithId} from "mongodb";
import {SessionDbType} from "./types/session-db-type";
import {SessionTimestampsType} from "./types/session-timestamps-type";

const sessionsRepository = {

    async findSessionByIatAndDeviceId(iat: Date, deviceId: string): Promise<WithId<SessionDbType> | null> {

        return sessionsCollection
            .findOne({iat, deviceId});
    },

    async insertSession(newSession: SessionDbType): Promise<InsertOneResult> {

        return await sessionsCollection
            .insertOne(newSession);
    },

    async updateSessionTimestamps(_id: ObjectId, data: SessionTimestampsType): Promise<boolean> {

        const result = await sessionsCollection
            .updateOne({_id}, {
                $set: {
                    'iat': data.iat,
                    'exp': data.exp
                }
            });

        return result.matchedCount === 1;
    },

    async deleteSession(id: string): Promise<boolean> {

        const result = await sessionsCollection
            .deleteOne({_id: new ObjectId(id)});

        return result.deletedCount === 1;
    }

}

export {sessionsRepository};