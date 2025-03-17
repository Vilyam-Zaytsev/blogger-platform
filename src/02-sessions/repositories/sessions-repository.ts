import {InsertOneResult, ObjectId, WithId} from "mongodb";
import {SessionTimestampsType} from "../types/session-timestamps-type";
import {injectable} from "inversify";
import {Session} from "../domain/session-entity";
import {SessionDocument, SessionModel} from "../../db/mongo-db/models/session-model";

@injectable()
class SessionsRepository {

    async findSessionByDeviceId(deviceId: ObjectId): Promise<WithId<Session> | null> {

        return SessionModel
            .findOne({deviceId});
    }

    async saveSession(newSession: SessionDocument): Promise<SessionDocument> {

        return await newSession
            .save();
    }

    async updateSessionTimestamps(_id: ObjectId, data: SessionTimestampsType): Promise<boolean> {

        const result = await SessionModel
            .updateOne({_id}, {
                $set: {
                    'iat': data.iat,
                    'exp': data.exp
                }
            });

        return result.matchedCount === 1;
    }

    async deleteSession(id: string): Promise<boolean> {

        const result = await SessionModel
            .deleteOne({_id: new ObjectId(id)});

        return result.deletedCount === 1;
    }

    async deleteAllSessionsExceptCurrent(userId: string, deviceId: ObjectId) {

        const result = await SessionModel
            .deleteMany({
                userId,
                deviceId: {$ne: deviceId}
            });

        return result.deletedCount > 0;
    }
}

export {SessionsRepository};