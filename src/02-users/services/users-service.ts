import {UserInputModel} from "../types/input-output-types";
import {UserDbType} from "../types/user-db-type";
import {usersRepository} from "../repositoryes/users-repository";
import {bcryptService} from "../../common/adapters/bcrypt-service";
import {ResultType} from "../../common/types/result-types/result-type";
import {ResultStatus} from "../../common/types/result-types/result-status";

const usersService = {
    async createUser(data: UserInputModel): Promise<ResultType<string | null>> {

        const {
            login,
            email,
            password
        } = data;

        const resultCandidateValidation: ResultType = await this.validateCandidateUniqueness(login, email);

        if (resultCandidateValidation.status !== ResultStatus.Success) return resultCandidateValidation

        const passwordHash = await bcryptService.generateHash(password);

        const newUser: UserDbType = {
            login,
            email,
            passwordHash,
            createdAt: new Date().toISOString(),
        };

        const result = await usersRepository
            .insertUser(newUser);

        return {
            status: ResultStatus.Created,
            extensions: [],
            data: String(result.insertedId)
        }
    },
    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository
            .deleteUser(id);
    },
    async validateCandidateUniqueness(login: string, email: string): Promise<ResultType> {

        const findByLogin = await usersRepository
            .findByLoginOrEmail(login);

        if (findByLogin) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Login incorrect',
                extensions: [{
                    field: 'login',
                    message: 'The user with this login already exists.',
                }],
                data: null
            }
        }

        const findByEmail = await usersRepository
            .findByLoginOrEmail(email);

        if (findByEmail) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Email incorrect',
                extensions: [{
                    field: 'email',
                    message: 'The user with this email already exists.',
                }],
                data: null
            }
        }


        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null
        };
    },

};

export {usersService};