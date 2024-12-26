import {PostDbType} from "../types/db-types/post-db-type";
import {PostViewModel} from "../types/input-output-types/posts-types";
import {postsCollection} from "../db/mongoDb";
import {ObjectId, WithId} from "mongodb";


const qPostsRepository = {
    async findPosts(): Promise<PostDbType[]> {
            return (await postsCollection
                .find({})
                .toArray());
    },
    async findPost(id: string): Promise<WithId<PostDbType> | null> {
            return await postsCollection
                .findOne({_id: new ObjectId(id)});
    },
    async findPostAndMapToViewModel(id: ObjectId): Promise<PostViewModel> {
        const post: WithId<PostDbType> = await postsCollection
            .findOne({_id: new ObjectId(id)}) as WithId<PostDbType>;

        return this.mapToViewModel(post);
    },
    async findPostsAndMapToViewModel(): Promise<PostViewModel[]> {
        return (await postsCollection
            .find({})
            .toArray())
            .map(p => this.mapToViewModel(p));
    },
    mapToViewModel(post: WithId<PostDbType>): PostViewModel {
        return {
            id: String(post._id),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt
        };
    },
    async findPostToDb(postId: string): Promise< PostDbType | null> {
        try {
        return await postsCollection.findOne({id: postId});
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch post')
        }
    }
};

export {qPostsRepository};