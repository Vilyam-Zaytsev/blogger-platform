import {UserInputModel} from "../types/input-output-types/user-types";
import {UserDbType} from "../types/db-types/user-db-type";
import {usersRepository} from "../repositoryes/users-repository";

const userService = {
    async createUser(data: UserInputModel): Promise<string | null> {

        const newUser: UserDbType = {
            ...data,
            createdAt: new Date().toISOString(),
        };

        const result = await usersRepository
            .insertUser(newUser);

        return String(result.insertedId);
    }
};

export {userService};