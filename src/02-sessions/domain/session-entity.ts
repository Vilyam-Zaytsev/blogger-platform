import {ObjectId} from "mongodb";
import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {SessionDto} from "./session-dto";
import {SessionTimestampsType} from "../types/session-timestamps-type";

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
type SessionDocument = HydratedDocument<Session, SessionMethods>;

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

    updateTimestamps(timestamps: SessionTimestampsType) {

        const {
            iat,
            exp
        } = timestamps;

        (this as SessionDocument).iat = iat;
        (this as SessionDocument).exp = exp;
    }

};

const sessionStatics: any = {

    createSession(dto: SessionDto): SessionDocument {

        return new SessionModel(dto) as SessionDocument;
    }
};

sessionSchema.methods = sessionMethods;
sessionSchema.statics = sessionStatics;

const SessionModel: SessionModel = mongoose.model<Session, SessionModel>('Session', sessionSchema);

export {
    SessionModel,
    SessionDocument
};