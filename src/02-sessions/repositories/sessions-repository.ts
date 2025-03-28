import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {SessionDocument, SessionModel} from "../domain/session-entity";

@injectable()
class SessionsRepository {

    async findSessionByDeviceId(deviceId: ObjectId): Promise<SessionDocument | null> {

        return SessionModel
            .findOne({deviceId});
    }

    async saveSession(newSession: SessionDocument): Promise<string> {

        const result = await newSession
            .save();

        return String(result._id);
    }

    async deleteSession(id: string): Promise<boolean> {

        const result: SessionDocument = await SessionModel
            .findByIdAndDelete(id)
            .exec();

        return !!result;
    }

    async deleteAllSessionsExceptCurrent(userId: string, deviceId: ObjectId) {

        const result = await SessionModel
            .deleteMany({
                userId,
                deviceId: {$ne: deviceId}
            })
            .exec();

        return result.deletedCount > 0;
    }
}

export {SessionsRepository};