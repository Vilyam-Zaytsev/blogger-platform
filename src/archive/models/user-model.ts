import {User} from "../../04-users/domain/user-entity";
import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {PasswordRecovery} from "../../04-users/domain/password-recovery-entity";
import {EmailConfirmation} from "../../04-users/domain/email-confirmation-entity";

enum ConfirmationStatus {
    Confirmed = 'Confirmed',
    NotConfirmed = 'Not confirmed'
}

type UserModel = Model<User>;
type UserDocument = HydratedDocument<User>;

const passwordRecoverySchema = new Schema<PasswordRecovery>({

    recoveryCode: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    }
});

const emailConfirmationSchema = new Schema<EmailConfirmation>({

    confirmationCode: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    confirmationStatus: {
        type: String,
        enum: Object.values(ConfirmationStatus),
        required: true
    }
});

const userSchema = new Schema<User>({
    login: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        required: true
    },
    passwordRecovery: passwordRecoverySchema,

    emailConfirmation: {
        type: emailConfirmationSchema,
        required: true
    }
});

const UserModel: UserModel = mongoose.model<User, UserModel>('User', userSchema);

export {
    UserModel,
    UserDocument,
    ConfirmationStatus
};