import {UserDbType} from "./types/user-db-type";
import {usersRepository} from "./repositoryes/users-repository";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatus} from "../common/types/result-types/result-status";
import {WithId} from "mongodb";
import {ResultObject} from "../common/helpers/result-object";

const usersService = {

    async createUser(user: UserDbType): Promise<ResultType<string | null>> {

        const resultCandidateValidation: ResultType = await this.validateCandidateUniqueness(user.login, user.email);

        if (resultCandidateValidation.status !== ResultStatus.Success) return resultCandidateValidation;

        const result = await usersRepository
            .insertUser(user);

        return ResultObject
            .success<string>(String(result.insertedId));
    },

    async deleteUser(id: string): Promise<boolean> {

        return await usersRepository
            .deleteUser(id);
    },

    async validateCandidateUniqueness(login: string, email: string): Promise<ResultType> {

        const findByLogin: WithId<UserDbType> | null = await usersRepository
            .findByLoginOrEmail(login);

        if (findByLogin) return ResultObject
            .badRequest(
                'login',
                'The user with this login already exists.'
            );

        const findByEmail: WithId<UserDbType> | null = await usersRepository
            .findByLoginOrEmail(email);

        if (findByEmail) return ResultObject
            .badRequest(
                'email',
                'The user with this email already exists.'
            );

        return ResultObject
            .success();
    },

};

export {usersService};