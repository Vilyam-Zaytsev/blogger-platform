import {ObjectId, WithId} from "mongodb";
import {
    MatchMode,
    PaginationAndSortFilterType,
} from "../../common/types/input-output-types/pagination-sort-types";
import {createUsersSearchFilter} from "../helpers/create-users-search-filter";
import {User} from "../domain/user-entity";
import {injectable} from "inversify";
import {ConfirmationStatus, UserDocument, UserModel} from "../../db/mongo-db/models/user-model";
import {SortOptionsType} from "../types/sort-options-type";

@injectable()
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

        return UserModel
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as SortOptionsType)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();
    }

    async findUser(id: string): Promise<WithId<User> | null> {

        return UserModel
            .findOne({_id: new ObjectId(id)})
            .lean();
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {

        return UserModel
            .findOne({
                $or: [{email: loginOrEmail}, {login: loginOrEmail}],
            })
            .lean();
    }

    async findByEmail(email: string): Promise<WithId<User> | null> {

        return UserModel
            .findOne({email})
            .lean();
    }

    async findByConfirmationCode(confirmationCode: string): Promise<WithId<User> | null> {

        return UserModel
            .findOne({'emailConfirmation.confirmationCode': confirmationCode})
            .lean();
    }

    async findByRecoveryCode(recoveryCode: string): Promise<WithId<User> | null> {

        return UserModel
            .findOne({'passwordRecovery.recoveryCode': recoveryCode})
            .lean();
    }

    async saveUser(newUser: UserDocument): Promise<UserDocument> {

        return await newUser
            .save();
    }

    async updateEmailConfirmation(
        _id: ObjectId,
        confirmationCode: string | null,
        expirationDate: Date | null
    ): Promise<boolean> {

        const result = await UserModel
            .updateOne({_id}, {
                $set: {
                    'emailConfirmation.confirmationCode': confirmationCode,
                    'emailConfirmation.expirationDate': expirationDate,
                }
            })
            .exec();

        return result.matchedCount === 1;
    }

    async updateConfirmationStatus(_id: ObjectId): Promise<boolean> {

        const result = await UserModel
            .updateOne({_id}, {
                $set: {
                    'emailConfirmation.confirmationStatus': ConfirmationStatus.Confirmed
                }
            })
            .exec();

        return result.modifiedCount === 1;
    }

    async updatePasswordRecovery(
        _id: ObjectId,
        recoveryCode: string | null,
        expirationDate: Date | null
    ): Promise<boolean> {

        const result = await UserModel
            .updateOne({_id}, {
                $set: {
                    'passwordRecovery.recoveryCode': recoveryCode,
                    'passwordRecovery.expirationDate': expirationDate,
                }
            })
            .exec();

        return result.matchedCount === 1;
    }

    async updatePassword(_id: ObjectId, newPassword: string): Promise<boolean> {

        const result = await UserModel
            .updateOne({_id}, {
                $set: {
                    passwordHash: newPassword
                }
            })
            .exec();

        return result.modifiedCount === 1;
    }


    async deleteUser(id: string): Promise<boolean> {

        const result = await UserModel
            .deleteOne({_id: new ObjectId(id)})
            .exec();

        return result.deletedCount === 1;
    }
}

export {UsersRepository};