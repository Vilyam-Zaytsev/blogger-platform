import {ConfirmationStatus} from "../types/confirmation-status";
import {BcryptService} from "../../01-auth/adapters/bcrypt-service";
import {randomUUID} from "node:crypto";
import {add} from "date-fns";
import {UserInputModel} from "../types/input-output-types";
import {EmailConfirmation} from "./email-confirmation-entity";

const bcryptService: BcryptService = new BcryptService();

class User {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    passwordRecoveryId: string | null;
    emailConfirmationId: string | null;

    private constructor(
        login: string,
        email: string,
        passwordHash: string,
    ) {
        this.login = login;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = new Date().toISOString();
        this.passwordRecoveryId = null;
        this.emailConfirmationId = null;
    };

    static async registrationUser(registrationUserDto: UserInputModel): Promise<User> {

        const {
            login,
            email,
            password
        } = registrationUserDto;

        const passwordHash: string = await bcryptService
            .generateHash(password);

        const user: User = new User(login, email, passwordHash);

        const confirmationCode: string = randomUUID();
        const expirationDate: Date = add(
            new Date(),
            {hours: 1, minutes: 1}
        );

        const emailConfirmation: EmailConfirmation = new EmailConfirmation(

        )

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