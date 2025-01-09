import {PaginationAndSortFilterType, PaginationResponse} from "../../common/types/input-output-types/pagination-sort-types";
import {UserViewModel} from "../types/input-output-types";
import {WithId} from "mongodb";
import {UserDbType} from "../types/user-db-type";
import {qUsersRepository} from "../repositoryes/qUsers-repository";
import {strict} from "node:assert";
import {req} from "../../../__tests__/helpers/test-helpers";

const qUserService = {
    async findUsers(sortQueryDto: PaginationAndSortFilterType): Promise<PaginationResponse<UserViewModel>> {

        const {
            pageNumber,
            pageSize,
            searchLoginTerm,
            searchEmailTerm
        } = sortQueryDto;

        const users: WithId<UserDbType>[] = await qUsersRepository
            .findUsers(sortQueryDto);

        const usersCount: number = await qUsersRepository
            .getUsersCount(searchLoginTerm, searchEmailTerm)

        return {
            pagesCount: Math.ceil(usersCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: usersCount,
            items: users.map(u => this.mapToViewModel(u))
        };
    },
    async findUser(id: string): Promise<UserViewModel | null> {

        const foundUser: WithId<UserDbType> | null= await qUsersRepository
            .findUser(id);

        if (!foundUser) return null;

        return this.mapToViewModel(foundUser);
    },
    mapToViewModel(user: WithId<UserDbType>): UserViewModel {
        return {
            id: String(user._id),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        };
    },
};

export {qUserService};