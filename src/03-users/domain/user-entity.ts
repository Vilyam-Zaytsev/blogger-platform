import {BcryptService} from "../../01-auth/adapters/bcrypt-service";
import {randomUUID} from "node:crypto";
import {add} from "date-fns";
import {UserDto} from "./user-dto";
import mongoose, {HydratedDocument, Model, Schema} from "mongoose";

//TODO: BcryptService внедрить при помощи inversify
const bcryptService: BcryptService = new BcryptService();

enum ConfirmationStatus {
    Confirmed = 'Confirmed',
    NotConfirmed = 'Not confirmed'
}

type EmailConfirmation = {
    confirmationCode: string | null,
    expirationDate: Date | null,
    confirmationStatus: ConfirmationStatus
};

type PasswordRecovery = {
    recoveryCode: string,
    expirationDate: Date
};


type User = {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    passwordRecovery: PasswordRecovery | null;
    emailConfirmation: EmailConfirmation;
};

type UserMethods = typeof userMethods;
type UserStatics = typeof userStatics;

type UserModel = Model<User, {}, UserMethods> & UserStatics;
type UserDocument = HydratedDocument<User, UserMethods>;

const passwordRecoverySchema = new Schema<PasswordRecovery>({

    recoveryCode: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    }
}, { _id: false });

const emailConfirmationSchema = new Schema<EmailConfirmation>({

    confirmationCode: {
        type: String,
    },
    expirationDate: {
        type: Date,
    },
    confirmationStatus: {
        type: String,
        enum: Object.values(ConfirmationStatus),
        required: true
    }
}, { _id: false });

const userSchema = new Schema<User, UserModel, UserMethods>({

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

const userMethods = {

    confirmRegistration() {

        (this as UserDocument).emailConfirmation.confirmationStatus = ConfirmationStatus.Confirmed;
        (this as UserDocument).emailConfirmation.expirationDate = null;
        (this as UserDocument).emailConfirmation.confirmationCode = null;
    },

    refreshConfirmationCode(): string {

        const confirmationCode: string = randomUUID();
        const expirationDate: Date = add(
            new Date(),
            {hours: 1, minutes: 1}
        );

        (this as UserDocument).emailConfirmation.confirmationCode = confirmationCode;
        (this as UserDocument).emailConfirmation.expirationDate = expirationDate;

        return confirmationCode;
    }
};


const userStatics: any = {

    async userCreationDuringRegistration(userDto: UserDto): Promise<UserDocument> {

        const {
            login,
            email,
            password
        } = userDto;

        const passwordHash: string = await bcryptService
            .generateHash(password);

        const emailConfirmation: EmailConfirmation = {
            confirmationCode: randomUUID(),
            expirationDate: add(
                new Date(),
                {hours: 1, minutes: 1}
            ),
            confirmationStatus: ConfirmationStatus.NotConfirmed
        };

        const createdAt: string = new Date().toISOString();

        const user: User = {
            login,
            email,
            passwordHash,
            createdAt,
            passwordRecovery: null,
            emailConfirmation
        };


        return new UserModel(user);
    },

    async createByAdmin(userDto: UserDto): Promise<UserDocument> {

        const {
            login,
            email,
            password
        } = userDto;

        const passwordHash: string = await bcryptService
            .generateHash(password);

        const emailConfirmation: EmailConfirmation = {
            confirmationCode: null,
            expirationDate: null,
            confirmationStatus: ConfirmationStatus.Confirmed
        }

        const user: User = {
            login,
            email,
            passwordHash,
            createdAt: new Date().toISOString(),
            passwordRecovery: null,
            emailConfirmation
        };


        return new UserModel(user) as UserDocument;
    }
};

userSchema.methods = userMethods;
userSchema.statics = userStatics;

const UserModel: UserModel = mongoose.model<User, UserModel>('User', userSchema);

export {
    User,
    UserModel,
    UserDocument,
    ConfirmationStatus,
    PasswordRecovery
};
