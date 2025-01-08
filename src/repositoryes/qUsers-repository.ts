import {ObjectId, Sort, WithId} from "mongodb";
import {UserDbType} from "../types/db-types/user-db-type";
import {usersCollection} from "../db/mongoDb";
import {PaginationAndSortFilterType, SearchFieldName} from "../types/input-output-types/pagination-sort-types";
import {createSearchFilter} from "../common/helpers/create-search-filter";

const qUsersRepository = {
    async findUsers(sortQueryDto: PaginationAndSortFilterType): Promise<WithId<UserDbType>[]> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm,
            searchEmailTerm
        } = sortQueryDto;

        const filter: any = createSearchFilter(
            {
                nameOfSearchField: searchLoginTerm ? SearchFieldName.userLogin : SearchFieldName.userEmail,
                searchLoginTerm,
                searchEmailTerm
            }
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

        const filter: any = createSearchFilter(
            {
                nameOfSearchField: searchLoginTerm
                    ? SearchFieldName.userLogin
                    : SearchFieldName.userEmail,
                searchLoginTerm,
                searchEmailTerm
            }
        );
            return usersCollection
            .countDocuments(filter);
    }
};

export {qUsersRepository};