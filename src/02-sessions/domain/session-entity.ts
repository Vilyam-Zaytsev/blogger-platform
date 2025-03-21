import {ObjectId} from "mongodb";
import {HydratedDocument, model, Model, Schema} from "mongoose";
import {SessionDto} from "./session-dto";

type Session = {
    userId: string;
    deviceId: ObjectId;
    deviceName: string;
    ip: string;
    iat: Date;
    exp: Date;
};

type SessionMethods = typeof sessionMethods;
type SessionStatics = typeof sessionStatics;

type SessionModel = Model<Session, {}, SessionMethods> & SessionStatics;
type SessionDocument = HydratedDocument<Session, SessionStatics>;

const sessionSchema = new Schema<Session, SessionModel, SessionMethods>({

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

const sessionMethods = {

};

const sessionStatics = {

    createSession(dto: SessionDto): SessionDocument {

        return new SessionModel(dto) as SessionDocument;
    }
};

sessionSchema.methods = sessionMethods;
sessionSchema.statics = sessionStatics;

const SessionModel: SessionModel = model<Session, SessionModel>('Session', sessionSchema);

export {
    SessionModel,
    SessionDocument
};