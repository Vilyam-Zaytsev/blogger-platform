import {ObjectId, WithId} from "mongodb";
import {
    MatchMode,
    PaginationAndSortFilterType,
} from "../../common/types/input-output-types/pagination-sort-types";
import {createUsersSearchFilter} from "../helpers/create-users-search-filter";
import {User} from "../domain/user-entity";
import {injectable} from "inversify";
import {ConfirmationStatus, UserDocument, UserModel} from "../../archive/models/user-model";
import {SortOptionsType} from "../types/sort-options-type";

@injectable()
class UsersRepository {

    async findUsers(sortQueryDto: PaginationAndSortFilterType): Promise<UserDocument[]> {

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
            .limit(pageSize);
    }

    async findUserById(id: string): Promise<UserDocument | null> {

        return UserModel
            .findById(id);
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {

        return UserModel
            .findOne({
                $or: [{email: loginOrEmail}, {login: loginOrEmail}],
            });
    }

    async findByEmail(email: string): Promise<UserDocument | null> {

        return UserModel
            .findOne({email});
    }

    async findByConfirmationCode(confirmationCode: string): Promise<UserDocument | null> {

        return UserModel
            .findOne({'emailConfirmation.confirmationCode': confirmationCode});
    }

    async findByRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {

        return UserModel
            .findOne({'passwordRecovery.recoveryCode': recoveryCode})

    }

    async saveUser(newUser: UserDocument): Promise<string> {

        const result: UserDocument =  await newUser
            .save();

        return String(result._id);
    }

    async deleteUser(id: string): Promise<boolean> {

        const result: UserDocument | null = await UserModel
            .findByIdAndDelete(id)
            .exec();

        return !!result;
    }
}

export {UsersRepository};