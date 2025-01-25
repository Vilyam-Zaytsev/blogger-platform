import {ConfirmationStatus, UserDbType} from "../types/user-db-type";
import {InsertOneResult, ObjectId, Sort, WithId} from "mongodb";
import {usersCollection} from "../../db/mongoDb";
import {
    MatchMode,
    PaginationAndSortFilterType,
} from "../../common/types/input-output-types/pagination-sort-types";
import {createUsersSearchFilter} from "../helpers/create-users-search-filter";

const usersRepository = {

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

    async findUser(id: string) : Promise<WithId<UserDbType> | null> {

        return usersCollection
            .findOne({_id: new ObjectId(id)});
    },

    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDbType> | null> {

        return usersCollection
            .findOne({
                $or: [{email: loginOrEmail}, {login: loginOrEmail}],
            });
    },

    async findByConfirmationCode(confirmationCode: string): Promise<WithId<UserDbType> | null> {

        return usersCollection
            .findOne({'emailConfirmation.confirmationCode': confirmationCode});
    },

    async insertUser(newUser: UserDbType): Promise<InsertOneResult> {

        return await usersCollection
            .insertOne(newUser);
    },

    async updateConfirmationStatus(id: ObjectId): Promise<boolean> {

        const result = await usersCollection
            .updateOne({id}, {$set: {'emailConfirmation.confirmationStatus': ConfirmationStatus.Confirmed}});

        return result.modifiedCount === 1;
    },

    async deleteUser(id: string): Promise<boolean> {

        const result = await usersCollection
            .deleteOne({_id: new ObjectId(id)});

        return result.deletedCount === 1;
    },
};

export {usersRepository};