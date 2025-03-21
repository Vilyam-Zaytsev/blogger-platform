import {sessionsCollection} from "../../db/mongoDb";
import {InsertOneResult, ObjectId, WithId} from "mongodb";
import {ActiveSessionType} from "../types/active-session-type";
import {SessionTimestampsType} from "../types/session-timestamps-type";
import {injectable} from "inversify";

@injectable()
class SessionsRepository {

    async findSessionByDeviceId(deviceId: ObjectId): Promise<WithId<ActiveSessionType> | null> {

        return sessionsCollection
            .findOne({deviceId});
    }

    async insertSession(newSession: ActiveSessionType): Promise<InsertOneResult> {

        return await sessionsCollection
            .insertOne(newSession);
    }

    async updateSessionTimestamps(_id: ObjectId, data: SessionTimestampsType): Promise<boolean> {

        const result = await sessionsCollection
            .updateOne({_id}, {
                $set: {
                    'iat': data.iat,
                    'exp': data.exp
                }
            });

        return result.matchedCount === 1;
    }

    async deleteSession(id: string): Promise<boolean> {

        const result = await sessionsCollection
            .deleteOne({_id: new ObjectId(id)});

        return result.deletedCount === 1;
    }

    async deleteAllSessionsExceptCurrent(userId: string, deviceId: ObjectId) {

        const result = await sessionsCollection
            .deleteMany({
                userId,
                deviceId: {$ne: deviceId}
            });

        return result.deletedCount > 0;
    }
}

export {SessionsRepository};