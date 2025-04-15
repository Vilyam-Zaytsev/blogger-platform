import {injectable} from "inversify";
import {SortOptionsType} from "../../common/types/sort-options-type";
import {UserDocument, UserModel} from "../domain/user-entity";
import {SortQueryDto} from "../../common/helpers/sort-query-dto";

@injectable()
class UsersRepository {

    async findUsers(sortQueryDto: SortQueryDto): Promise<UserDocument[]> {
//TODO: зачем мне здесь сортировка, погинация и фильтр???
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

        return UserModel
            .find(filter.$or.length > 0 ? filter : {})
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as SortOptionsType)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);
    }

    async findUserById(id: string): Promise<UserDocument | null> {

        return UserModel
            .findById(id);
    }

    async findUsersByIds(ids: string[]): Promise<UserDocument[]> {

        return UserModel
            .find({_id: {$in: ids}})
            .exec();
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
            .findByIdAndDelete(id);

        return !!result;
    }
}

export {UsersRepository};