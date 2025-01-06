import {ObjectId, Sort, WithId} from "mongodb";
import {UserDbType} from "../types/db-types/user-db-type";
import {usersCollection} from "../db/mongoDb";
import {PaginationAndSortFilterType} from "../types/input-output-types/pagination-sort-types";

const qUsersRepository = {
    async findUsers(sortQueryDto: PaginationAndSortFilterType): Promise<WithId<UserDbType>[]> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm
        } = sortQueryDto;

        return await usersCollection
            .find()
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
    },
    async findUser(id: string): Promise<WithId<UserDbType> | null> {
        return await usersCollection
            .findOne({_id: new ObjectId(id)});
    },
    async getUsersCount(): Promise<number> {
        return usersCollection
            .countDocuments();
    }
};

export {qUsersRepository};