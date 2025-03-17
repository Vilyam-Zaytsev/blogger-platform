import {ObjectId, Sort, WithId} from "mongodb";
import {usersCollection} from "../../db/mongo-db/mongoDb";
import {
    MatchMode,
    PaginationAndSortFilterType,
    Paginator
} from "../../common/types/input-output-types/pagination-sort-types";
import {createUsersSearchFilter} from "../helpers/create-users-search-filter";
import {UserMeViewModel, UserViewModel} from "../types/input-output-types";
import {User} from "../domain/user.entity";
import {injectable} from "inversify";

@injectable()
class UsersQueryRepository {

    async findUsers(sortQueryDto: PaginationAndSortFilterType): Promise<UserViewModel[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm,
            searchEmailTerm
        } = sortQueryDto;

        const filter: any = createUsersSearchFilter(
            {
                searchLoginTerm,
                searchEmailTerm
            },
            MatchMode.Partial
        );

        const users: WithId<User>[] = await usersCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return users.map(u => this._mapDbUserToViewModel(u));
    }

    async findUser(id: string): Promise<UserViewModel | null> {

        const user: WithId<User> | null = await usersCollection
            .findOne({_id: new ObjectId(id)});

        if (!user) return null;

        return this._mapDbUserToViewModel(user);
    }

    async findUserAndMapToMeViewModel(id: string): Promise<UserMeViewModel | null> {

        const user: WithId<User> | null = await usersCollection
            .findOne({_id: new ObjectId(id)});

        if (!user) return null;

        return this._mapDbUserToMeViewModel(user);
    }

    async getUsersCount(
        searchLoginTerm: string | null,
        searchEmailTerm: string | null
    ): Promise<number> {

        const filter: any = createUsersSearchFilter(
            {
                searchLoginTerm,
                searchEmailTerm
            },
            MatchMode.Partial
        );

        return usersCollection
            .countDocuments(filter);
    }

    _mapDbUserToViewModel(user: WithId<User>): UserViewModel {

        return {
            id: String(user._id),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        };
    }

    _mapDbUserToMeViewModel(user: WithId<User>): UserMeViewModel {

        return {
            email: user.email,
            login: user.login,
            userId: String(user._id),
        };
    }

    _mapUsersViewModelToPaginationResponse(
        users: UserViewModel[],
        usersCount: number,
        paginationAndSortFilter: PaginationAndSortFilterType
    ): Paginator<UserViewModel> {

        return {
            pagesCount: Math.ceil(usersCount / paginationAndSortFilter.pageSize),
            page: paginationAndSortFilter.pageNumber,
            pageSize: paginationAndSortFilter.pageSize,
            totalCount: usersCount,
            items: users
        };
    }
}

export {UsersQueryRepository};