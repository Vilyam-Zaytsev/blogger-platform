import {ConfirmationStatus} from "../types/confirmation-status";
import {BcryptService} from "../../01-auth/adapters/bcrypt-service";
import {randomUUID} from "node:crypto";
import {add} from "date-fns";
import {UserInputModel} from "../types/input-output-types";

const bcryptService: BcryptService = new BcryptService();

class User {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    passwordRecovery: {
        recoveryCode: string | null,
        expirationDate: Date | null;
    };
    emailConfirmation: {
        confirmationCode: string | null;
        expirationDate: Date | null;
        confirmationStatus: ConfirmationStatus;
    };

    private constructor(
        login: string,
        email: string,
        passwordHash: string,
        confirmationStatus: ConfirmationStatus
    ) {
        this.login = login;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = new Date().toISOString();
        this.passwordRecovery = {
            recoveryCode: null,
            expirationDate: null
        };
        this.emailConfirmation = {
            confirmationCode: null,
            expirationDate: null,
            confirmationStatus
        };
    };

    static async registrationUser(registrationUserDto: UserInputModel): Promise<User> {

        const {
            login,
            email,
            password
        } = registrationUserDto;

        const passwordHash: string = await bcryptService
            .generateHash(password);

        const user: User = new User(login, email, passwordHash, ConfirmationStatus.NotConfirmed);

        user.emailConfirmation.confirmationCode = randomUUID();
        user.emailConfirmation.expirationDate = add(
            new Date(),
            {hours: 1, minutes: 1}
        );

        return user;
    };

    static async createByAdmin(
        login: string,
        email: string,
        password: string,
    ): Promise<User> {

        const passwordHash: string = await bcryptService
            .generateHash(password);

        return new User(login, email, passwordHash, ConfirmationStatus.Confirmed);
    }
}

export {User};