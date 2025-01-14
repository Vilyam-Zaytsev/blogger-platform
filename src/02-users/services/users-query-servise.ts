import {
    PaginationAndSortFilterType,
    PaginationResponse
} from "../../common/types/input-output-types/pagination-sort-types";
import {UserMeViewModel, UserViewModel} from "../types/input-output-types";
import {WithId} from "mongodb";
import {UserDbType} from "../types/user-db-type";
import {qUsersRepository} from "../repositoryes/users-query-repository";
import {PresentationView} from "../types/presentation-view";

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
    async findUser(id: string, desiredPresentationView: PresentationView): Promise<UserViewModel | UserMeViewModel | null> {

        const foundUser: WithId<UserDbType> | null= await qUsersRepository
            .findUser(id);

        if (!foundUser) return null;


        switch (desiredPresentationView) {
            case PresentationView.ViewModal:
                return this.mapToViewModel(foundUser);
            case PresentationView.MeViewModal:
                return this.mapToMeViewModel(foundUser);
        }

    },
    mapToViewModel(user: WithId<UserDbType>): UserViewModel {
        return {
            id: String(user._id),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        };
    },
    mapToMeViewModel(user: WithId<UserDbType>): UserMeViewModel {
        return {
            email: user.email,
            login: user.login,
            userId: String(user._id),
        };
    },
};

export {qUserService};