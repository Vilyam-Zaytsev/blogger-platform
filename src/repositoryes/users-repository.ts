import {UserDbType} from "../types/db-types/user-db-type";
import {InsertOneResult} from "mongodb";
import {usersCollection} from "../db/mongoDb";

const usersRepository = {
    async insertUser(newUser: UserDbType): Promise<InsertOneResult> {
        return await usersCollection
            .insertOne(newUser);
    }
};

export {usersRepository};