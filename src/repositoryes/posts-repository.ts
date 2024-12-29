import {PostDbType} from "../types/db-types/post-db-type";
import {PostInputModel} from "../types/input-output-types/posts-types";
import {blogsCollection, postsCollection} from "../db/mongoDb";
import {InsertOneResult, ObjectId, Sort, WithId} from "mongodb";
import {createFilter} from "../helpers/createFilter";

const postsRepository = {
    async findPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: 'asc' | 'desc'
    ): Promise<WithId<PostDbType>[]> {
        return await postsCollection
            .find({})
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },
    async getPostsCount(): Promise<number> {
        return postsCollection.countDocuments({});
    },
    async createPost(newPost: PostDbType): Promise<InsertOneResult> {
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