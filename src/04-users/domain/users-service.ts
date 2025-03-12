import {UsersRepository} from "../repositoryes/users-repository";
import {ResultType} from "../../common/types/result-types/result-type";
import {ResultStatus} from "../../common/types/result-types/result-status";
import {WithId} from "mongodb";
import {BadRequestResult, SuccessResult} from "../../common/helpers/result-object";
import {User} from "./user.entity";

class UsersService {

    constructor(private usersRepository: UsersRepository = new UsersRepository()) {};

    async createUser(user: User): Promise<ResultType<string | null>> {

        const resultCandidateValidation: ResultType = await this.validateCandidateUniqueness(user.login, user.email);

        if (resultCandidateValidation.status !== ResultStatus.Success) return resultCandidateValidation;

        const result = await this.usersRepository
            .insertUser(user);

        return SuccessResult
            .create<string>(String(result.insertedId));
    }

    async deleteUser(id: string): Promise<boolean> {

        return await this.usersRepository
            .deleteUser(id);
    }

    async validateCandidateUniqueness(login: string, email: string): Promise<ResultType> {

        const findByLogin: WithId<User> | null = await this.usersRepository
            .findByLoginOrEmail(login);

        if (findByLogin) {

            return BadRequestResult
                .create(
                    'login',
                    'The user with this login already exists.',
                    'Failed to create a new user record.'
                );
        }

        const findByEmail: WithId<User> | null = await this.usersRepository
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

export {UsersService};