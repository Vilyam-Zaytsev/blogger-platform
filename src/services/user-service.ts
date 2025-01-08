import {UserInputModel} from "../types/input-output-types/user-types";
import {UserDbType} from "../types/db-types/user-db-type";
import {usersRepository} from "../repositoryes/users-repository";
import {bcryptService} from "../common/services/bcryptService";

const userService = {
    async createUser(data: UserInputModel): Promise<string> {

        const {
            login,
            email,
            password
        } = data;

        const passwordHash = await bcryptService.generateHash(password);

        const newUser: UserDbType = {
            login,
            email,
            passwordHash,
            createdAt: new Date().toISOString(),
        };

        const result = await usersRepository
            .insertUser(newUser);

        return String(result.insertedId);
    },
    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository
            .deleteUser(id);
    },
};

export {userService};