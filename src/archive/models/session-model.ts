import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {Session} from "../../02-sessions/domain/session-entity";

type SessionModel = Model<Session>;
type SessionDocument = HydratedDocument<Session>;

const sessionSchema = new Schema<Session>({

    userId: {
        type: String,
        required: true
    },
    deviceId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    deviceName: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    iat: {
        type: Date,
        required: true
    },
    exp: {
        type: Date,
        required: true
    },
});

const SessionModel: SessionModel = mongoose.model<Session, SessionModel>('Session', sessionSchema);

export {
    SessionModel,
    SessionDocument
};