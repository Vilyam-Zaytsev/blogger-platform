import {ObjectId, Sort, WithId} from "mongodb";
import {UserDbType} from "../types/user-db-type";
import {usersCollection} from "../../db/mongoDb";
import {MatchMode, PaginationAndSortFilterType} from "../../common/types/input-output-types/pagination-sort-types";
import {createUsersSearchFilter} from "../helpers/create-users-search-filter";

const usersQueryRepository = {
    async findUsers(sortQueryDto: PaginationAndSortFilterType): Promise<WithId<UserDbType>[]> {
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

        return await usersCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
    },
    async findUser(id: string): Promise<WithId<UserDbType> | null> {
        return await usersCollection
            .findOne({_id: new ObjectId(id)});
    },
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
};

export {usersQueryRepository};