import {BcryptService} from "../../01-auth/adapters/bcrypt-service";
import {randomUUID} from "node:crypto";
import {add} from "date-fns";
import {EmailConfirmationDto} from "./email-confirmation-dto";
import {PasswordRecoveryDto} from "./password-recovery-dto";
import {UserDto} from "./user-dto";

const bcryptService: BcryptService = new BcryptService();

import mongoose, {HydratedDocument, Model, Schema} from "mongoose";

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
    emailConfirmation: EmailConfirmation | null;
};

type UserMethods = typeof userMethods;
type UserStatics = typeof userStatics;

type UserModel = Model<User, {}, UserMethods> & UserStatics;
type UserDocument = HydratedDocument<User, UserMethods>;

const passwordRecoverySchema = new Schema<PasswordRecoveryDto>({

    recoveryCode: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    }
});

const emailConfirmationSchema = new Schema<EmailConfirmationDto>({

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

const userMethods = {};

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

const UserModel: UserModel = mongoose.model<User, UserModel>('User', userSchema);

export {
    User,
    UserModel,
    UserDocument,
    ConfirmationStatus
};

// class User {
//     login: string;
//     email: string;
//     passwordHash: string;
//     createdAt: string;
//     passwordRecovery: PasswordRecoveryDto | null;
//     emailConfirmation: EmailConfirmationDto | null;
//
//     private constructor(
//         login: string,
//         email: string,
//         passwordHash: string,
//     ) {
//         this.login = login;
//         this.email = email;
//         this.passwordHash = passwordHash;
//         this.createdAt = new Date().toISOString();
//         this.passwordRecovery = null;
//         this.emailConfirmation = null;
//     };
//
//     static async registrationUser(userDto: UserDto): Promise<User> {
//
//         const {
//             login,
//             email,
//             password
//         } = userDto;
//
//         const passwordHash: string = await bcryptService
//             .generateHash(password);
//
//         const user: User = new this(login, email, passwordHash);
//
//         const confirmationCode: string = randomUUID();
//         const expirationDate: Date = add(
//             new Date(),
//             {hours: 1, minutes: 1}
//         );
//
//         user.emailConfirmation = new EmailConfirmationDto(
//             confirmationCode,
//             expirationDate,
//             ConfirmationStatus.NotConfirmed
//         );
//
//         return user;
//     };
//
//     static async createByAdmin(
//         login: string,
//         email: string,
//         password: string,
//     ): Promise<User> {
//
//         const passwordHash: string = await bcryptService
//             .generateHash(password);
//
//         const user: User = new this(login, email, passwordHash);
//
//         const emailConfirmation: EmailConfirmationDto = new EmailConfirmationDto(
//             null,
//             null,
//             ConfirmationStatus.Confirmed
//         );
//
//         user.emailConfirmation = emailConfirmation;
//
//         return user;
//     }
// }
//
// export {User};


// class User {
//     login: string;
//     email: string;
//     passwordHash: string;
//     createdAt: string;
//     passwordRecovery: {
//         recoveryCode: string | null,
//         expirationDate: Date | null;
//     };
//     emailConfirmation: {
//         confirmationCode: string | null;
//         expirationDate: Date | null;
//         confirmationStatus: ConfirmationStatus;
//     };
//
//     private constructor(
//         login: string,
//         email: string,
//         passwordHash: string,
//         confirmationStatus: ConfirmationStatus
//     ) {
//         this.login = login;
//         this.email = email;
//         this.passwordHash = passwordHash;
//         this.createdAt = new Date().toISOString();
//         this.passwordRecovery = {
//             recoveryCode: null,
//             expirationDate: null
//         };
//         this.emailConfirmation = {
//             confirmationCode: null,
//             expirationDate: null,
//             confirmationStatus
//         };
//     };
//
//     static async registrationUser(registrationUserDto: UserInputModel): Promise<User> {
//
//         const {
//             login,
//             email,
//             password
//         } = registrationUserDto;
//
//         const passwordHash: string = await bcryptService
//             .generateHash(password);
//
//         const user: User = new User(login, email, passwordHash, ConfirmationStatus.NotConfirmed);
//
//         user.emailConfirmation.confirmationCode = randomUUID();
//         user.emailConfirmation.expirationDate = add(
//             new Date(),
//             {hours: 1, minutes: 1}
//         );
//
//         return user;
//     };
//
//     static async createByAdmin(
//         login: string,
//         email: string,
//         password: string,
//     ): Promise<User> {
//
//         const passwordHash: string = await bcryptService
//             .generateHash(password);
//
//         return new User(login, email, passwordHash, ConfirmationStatus.Confirmed);
//     }
// }