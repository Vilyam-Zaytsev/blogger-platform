import {PostDbType} from "../types/db-types/post-db-type";
import {PostInputModel} from "../types/input-output-types/posts-types";
import {postsCollection} from "../db/mongoDb";
import {InsertOneResult, ObjectId} from "mongodb";

const postsRepository = {
    async insertPost(newPost: PostDbType): Promise<InsertOneResult> {
            return  await postsCollection
                .insertOne(newPost);
    },
    async updatePost(id: string, data: PostInputModel): Promise<boolean> {

            const result = await postsCollection
                .updateOne({_id: new ObjectId(id)}, {$set: {...data}});

            return result.matchedCount === 1;
    },
    async deletePost(id: string): Promise<boolean> {

            const result = await postsCollection
                .deleteOne({_id: new ObjectId(id)});

            return result.deletedCount === 1;
    },
};

export {postsRepository};