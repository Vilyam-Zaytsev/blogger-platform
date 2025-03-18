import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {PasswordRecovery} from "../../../04-users/domain/password-recovery-entity";

type PasswordRecoveryModel = Model<PasswordRecovery>;
type PasswordRecoveryDocument = HydratedDocument<PasswordRecovery>;

const passwordRecoverySchema = new Schema<PasswordRecovery>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    recoveryCode: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    }
});

const PasswordRecoveryModel: PasswordRecoveryModel = mongoose
.model<PasswordRecovery, PasswordRecoveryModel>(
    'PasswordRecovery',
    passwordRecoverySchema
);

export {
    PasswordRecoveryModel,
    PasswordRecoveryDocument
};