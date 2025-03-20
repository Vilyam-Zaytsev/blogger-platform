import {UsersRepository} from "../repositoryes/users-repository";
import {ResultType} from "../../common/types/result-types/result-type";
import {ResultStatus} from "../../common/types/result-types/result-status";
import {WithId} from "mongodb";
import {BadRequestResult, InternalServerErrorResult, SuccessResult} from "../../common/helpers/result-object";
import {User} from "./user-entity";
import {injectable} from "inversify";
import {UserDocument, UserModel} from "../../db/mongo-db/models/user-model";

@injectable()
class UsersService {

    constructor(private usersRepository: UsersRepository) {
    };

    async createUser(candidate: User): Promise<ResultType<string | null>> {

        const resultCandidateValidation: ResultType = await this.validateCandidateUniqueness(
            candidate.login,
            candidate.email
        );

        if (resultCandidateValidation.status !== ResultStatus.Success) {

            return resultCandidateValidation;
        }

        const user: UserDocument = new UserModel(candidate);

        const resultSaveUser: string = await this.usersRepository
                .saveUser(user);

        return SuccessResult
            .create<string>(resultSaveUser);
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