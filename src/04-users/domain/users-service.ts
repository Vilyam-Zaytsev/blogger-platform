import {UserDbType} from "../types/user-db-type";
import {usersRepository} from "../repositoryes/users-repository";
import {ResultType} from "../../common/types/result-types/result-type";
import {ResultStatus} from "../../common/types/result-types/result-status";
import {WithId} from "mongodb";
import {BadRequestResult, SuccessResult} from "../../common/helpers/result-object";

class UsersService {

    async createUser(user: UserDbType): Promise<ResultType<string | null>> {

        const resultCandidateValidation: ResultType = await this.validateCandidateUniqueness(user.login, user.email);

        if (resultCandidateValidation.status !== ResultStatus.Success) return resultCandidateValidation;

        const result = await usersRepository
            .insertUser(user);

        return SuccessResult
            .create<string>(String(result.insertedId));
    }

    async deleteUser(id: string): Promise<boolean> {

        return await usersRepository
            .deleteUser(id);
    }

    async validateCandidateUniqueness(login: string, email: string): Promise<ResultType> {

        const findByLogin: WithId<UserDbType> | null = await usersRepository
            .findByLoginOrEmail(login);

        if (findByLogin) {

            return BadRequestResult
                .create(
                    'login',
                    'The user with this login already exists.',
                    'Failed to create a new user record.'
                );
        }

        const findByEmail: WithId<UserDbType> | null = await usersRepository
            .findByLoginOrEmail(email);

        if (findByEmail) {

            return BadRequestResult
                .create(
                    'email',
                    'The user with this email already exists.',
                    'Failed to create a new user record.'
                );
        }

        return SuccessResult
            .create(null);
    }

}

const usersService: UsersService = new UsersService();

export {usersService};