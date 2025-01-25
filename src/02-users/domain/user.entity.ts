import {ConfirmationStatuses} from "../types/user-db-type";
import {bcryptService} from "../../common/adapters/bcrypt-service";

class User {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    emailConfirmation: {
        confirmationCode: string | null;
        expirationDate: Date | null;
        confirmationStatus: ConfirmationStatuses;
    };

     private constructor(
        login: string,
        email: string,
        passwordHash: string,
        confirmationStatus: ConfirmationStatuses
    ) {
        this.login = login
        this.email = email
        this.passwordHash = passwordHash
        this.createdAt = new Date().toISOString()
        this.emailConfirmation = {
            confirmationCode: null,
            expirationDate: null,
            confirmationStatus
        };
    };

    static async registrationUser(
        login: string,
        email: string,
        password: string
    ): Promise<User> {

        const passwordHash: string = await bcryptService
            .generateHash(password);

        return new User(login, email, passwordHash, ConfirmationStatuses.NotConfirmed);
    };

    static async createByAdmin(
        login: string,
        email: string,
        password: string
    ): Promise<User> {

        const passwordHash: string = await bcryptService
            .generateHash(password);

        return new User(login, email, passwordHash, ConfirmationStatuses.Confirmed);
    }
}

export {User};