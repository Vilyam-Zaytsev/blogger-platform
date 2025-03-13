import {ConfirmationStatus} from "../types/confirmation-status";
import {InsertOneResult, ObjectId, Sort, WithId} from "mongodb";
import {usersCollection} from "../../db/mongoDb";
import {
    MatchMode,
    PaginationAndSortFilterType,
} from "../../common/types/input-output-types/pagination-sort-types";
import {createUsersSearchFilter} from "../helpers/create-users-search-filter";
import {User} from "../domain/user.entity";

class UsersRepository {

    async findUsers(sortQueryDto: PaginationAndSortFilterType): Promise<WithId<User>[]> {

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
    }

    async findUser(id: string): Promise<WithId<User> | null> {

        return usersCollection
            .findOne({_id: new ObjectId(id)});
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {

        return usersCollection
            .findOne({
                $or: [{email: loginOrEmail}, {login: loginOrEmail}],
            });
    }

    async findByEmail(email: string): Promise<WithId<User> | null> {

        return usersCollection
            .findOne({email});
    }

    async findByConfirmationCode(confirmationCode: string): Promise<WithId<User> | null> {

        return usersCollection
            .findOne({'emailConfirmation.confirmationCode': confirmationCode});
    }

    async findByRecoveryCode(recoveryCode: string): Promise<WithId<User> | null> {

        return usersCollection
            .findOne({'passwordRecovery.recoveryCode': recoveryCode});
    }

    async insertUser(newUser: User): Promise<InsertOneResult> {

        return await usersCollection
            .insertOne(newUser);
    }

    async updateEmailConfirmation(
        _id: ObjectId,
        confirmationCode: string,
        expirationDate: Date
    ): Promise<boolean> {

        const result = await usersCollection
            .updateOne({_id}, {
                $set: {
                    'emailConfirmation.confirmationCode': confirmationCode,
                    'emailConfirmation.expirationDate': expirationDate,
                }
            });

        return result.matchedCount === 1;
    }

    async updatePasswordRecovery(
        _id: ObjectId,
        recoveryCode: string,
        expirationDate: Date
    ): Promise<boolean> {

        const result = await usersCollection
            .updateOne({_id}, {
                $set: {
                    'passwordRecovery.recoveryCode': recoveryCode,
                    'passwordRecovery.expirationDate': expirationDate,
                }
            });

        return result.matchedCount === 1;
    }

    async updateConfirmationStatus(_id: ObjectId): Promise<boolean> {

        const result = await usersCollection
            .updateOne({_id}, {
                $set: {
                    'emailConfirmation.confirmationStatus': ConfirmationStatus.Confirmed
                }
            });

        return result.modifiedCount === 1;
    }

    async updatePassword(_id: ObjectId, newPassword: string): Promise<boolean> {

        const result = await usersCollection
            .updateOne({_id}, {
                $set: {
                    passwordHash: newPassword
                }
            });

        return result.modifiedCount === 1;
    }


    async deleteUser(id: string): Promise<boolean> {

        const result = await usersCollection
            .deleteOne({_id: new ObjectId(id)});

        return result.deletedCount === 1;
    }
}

export {UsersRepository};