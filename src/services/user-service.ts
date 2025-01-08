import {UserInputModel} from "../types/input-output-types/user-types";
import {UserDbType} from "../types/db-types/user-db-type";
import {usersRepository} from "../repositoryes/users-repository";
import {bcryptServices} from "../common/services/bcryptServices";

const userService = {
    async createUser(data: UserInputModel): Promise<string> {

        const {
            login,
            email,
            password
        } = data;

        const passwordHash = await bcryptServices.generateHash(password);

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