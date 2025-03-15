import {PostDbType} from "../types/post-db-type";
import {PostInputModel} from "../types/input-output-types";
import {postsCollection} from "../../db/mongoDb";
import {InsertOneResult, ObjectId, WithId} from "mongodb";
import {injectable} from "inversify";

@injectable()
class PostsRepository {

    async findPost(id: string): Promise<WithId<PostDbType> | null> {

        return await postsCollection
            .findOne({_id: new ObjectId(id)});
    }

    async insertPost(newPost: PostDbType): Promise<InsertOneResult> {

            return  await postsCollection
                .insertOne(newPost);
    }

    async updatePost(id: string, data: PostInputModel): Promise<boolean> {

            const result = await postsCollection
                .updateOne({_id: new ObjectId(id)}, {$set: {...data}});

            return result.matchedCount === 1;
    }

    async deletePost(id: string): Promise<boolean> {

            const result = await postsCollection
                .deleteOne({_id: new ObjectId(id)});

            return result.deletedCount === 1;
    }
}

export {PostsRepository};