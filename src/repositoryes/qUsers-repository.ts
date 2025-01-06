import {SortQueryFilterType} from "../types/input-output-types/sort-query-filter-types";
import {ObjectId, Sort, WithId} from "mongodb";
import {UserDbType} from "../types/db-types/user-db-type";
import {usersCollection} from "../db/mongoDb";
import {usersRepository} from "./users-repository";

const qUsersRepository = {
    async findUsers(sortQueryDto: SortQueryFilterType): Promise<WithId<UserDbType>[]> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
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