import {UserDbType} from "../types/db-types/user-db-type";
import {InsertOneResult, ObjectId, WithId} from "mongodb";
import {usersCollection} from "../db/mongoDb";

const usersRepository = {
    async insertUser(newUser: UserDbType): Promise<InsertOneResult> {
        return await usersCollection
            .insertOne(newUser);
    },
    async deleteUser(id: string): Promise<boolean> {
        const result = await usersCollection
            .deleteOne({_id: new ObjectId(id)});

        return result.deletedCount === 1;
    },
    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDbType> | null> {
        return usersCollection
            .findOne({
                $or: [{email: loginOrEmail}, {login: loginOrEmail}],
            });
    }
};

export {usersRepository};