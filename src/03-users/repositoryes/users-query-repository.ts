import {ObjectId, WithId} from "mongodb";
import {
    Paginator
} from "../../common/types/input-output-types/pagination-sort-types";
import {UserMeViewModel, UserViewModel} from "../types/input-output-types";
import {injectable} from "inversify";
import {SortOptionsType} from "../../common/types/sort-options-type";
import {User, UserModel} from "../domain/user-entity";
import {SortQueryDto} from "../../common/helpers/sort-query-dto";

@injectable()
class UsersQueryRepository {

    async findUsers(sortQueryDto: SortQueryDto): Promise<UserViewModel[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm,
            searchEmailTerm
        } = sortQueryDto;

        let filter: any = {$or: []};

        searchLoginTerm
            ? filter.$or.push({login: {$regex: searchLoginTerm, $options: 'i'}})
            : null;

        searchEmailTerm
            ? filter.$or.push({email: {$regex: searchEmailTerm, $options: 'i'}})
            : null;

        const users: WithId<User>[] = await UserModel
            .find(filter.$or.length > 0 ? filter : {})
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as SortOptionsType)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        return users.map(u => this._mapDbUserToViewModel(u));
    }

    async findUser(id: string): Promise<UserViewModel | null> {

        const user: WithId<User> | null = await UserModel
            .findById(id)
            .exec();

        if (!user) return null;

        return this._mapDbUserToViewModel(user);
    }

    async findUserAndMapToMeViewModel(id: string): Promise<UserMeViewModel | null> {

        const user: WithId<User> | null = await UserModel
            .findOne({_id: new ObjectId(id)})
            .exec();

        if (!user) return null;

        return this._mapDbUserToMeViewModel(user);
    }

    async getUsersCount(
        searchLoginTerm: string | null,
        searchEmailTerm: string | null
    ): Promise<number> {

        let filter: any = {$or: []};

        searchLoginTerm
            ? filter.$or.push({login: {$regex: searchLoginTerm, $options: 'i'}})
            : null;

        searchEmailTerm
            ? filter.$or.push({email: {$regex: searchEmailTerm, $options: 'i'}})
            : null;

        return UserModel
            .countDocuments(filter.$or.length > 0 ? filter : {});
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
        sortQueryDto: SortQueryDto
    ): Paginator<UserViewModel> {

        return {
            pagesCount: Math.ceil(usersCount / sortQueryDto.pageSize),
            page: sortQueryDto.pageNumber,
            pageSize: sortQueryDto.pageSize,
            totalCount: usersCount,
            items: users
        };
    }
}

export {UsersQueryRepository};