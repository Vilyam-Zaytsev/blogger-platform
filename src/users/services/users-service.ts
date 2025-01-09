import {UserInputModel} from "../types/input-output-types";
import {UserDbType} from "../types/user-db-type";
import {usersRepository} from "../repositoryes/users-repository";
import {bcryptService} from "../../common/services/bcryptService";
import {MatchMode, UsersSearchFilterType} from "../../common/types/input-output-types/pagination-sort-types";
import {createUserSearchFilter} from "../helpers/create-users-search-filter";
import {FieldNameType} from "../../common/types/input-output-types/output-errors-type";

const usersService = {
    async createUser(data: UserInputModel): Promise<string> {

        const {
            login,
            email,
            password
        } = data;

        // const isUser: boolean = await this.validateUserUniqueness(login, email);

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
    // async validateUserUniqueness(login, email): Promise<boolean> {
    //
    //     const filter = createUserSearchFilter(
    //         {
    //             searchLoginTerm: login,
    //             searchEmailTerm: email
    //         },
    //         MatchMode.Exact
    //     );
    //
    //     const isUser = await usersRepository
    //         .findByFilter(filter);
    //
    //     return !!isUser;
    // },

};

export {usersService};