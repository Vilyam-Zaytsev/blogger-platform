import {PostDbType} from "../types/db-types/post-db-type";
import {PostInputModel, PostViewModel} from "../types/input-output-types/posts-types";
import {blogsRepository} from "./blogs-repository";
import {postsCollection} from "../db/mongoDb";
import {ObjectId} from "mongodb";

const postsRepository = {
    async findPosts(): Promise<PostViewModel[] | []> {
        try {
            return await postsCollection
                .find({}, {
                    projection: {
                        _id: 0,
                        id: 1,
                        title: 1,
                        shortDescription: 1,
                        content: 1,
                        blogId: 1,
                        blogName: 1,
                        createdAt: 1
                    }
                }).toArray() as PostViewModel[];
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch posts');
        }
    },
    async findPostById(postId: string): Promise<PostViewModel | null> {
        try {
            return await postsCollection
                .findOne({id: postId}, {
                    projection: {
                        _id: 0,
                        id: 1,
                        title: 1,
                        shortDescription: 1,
                        content: 1,
                        blogId: 1,
                        blogName: 1,
                        createdAt: 1
                    }
                });
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch post');
        }
    },
    async createPost(postData: PostInputModel): Promise<PostViewModel> {
        try {
            const newPost: PostDbType = {
                _id: new ObjectId(),
                id: String(Math.floor(Date.now() + Math.random())),
                    ...postData,
                blogName: (await blogsRepository.findBlogToDb(postData.blogId))!.name,
                createdAt: new Date().toISOString(),
            }
        } catch (error) {
            console.error(error);
            throw  new Error('Failed to create a post');
        }
    },
    async updatePost(postId: string, postData: PostInputModel): Promise<boolean> {
        try {
            const result = await postsCollection.updateOne({id: postId}, {$set: {...postData}});

            return result.matchedCount === 1;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to update a post')
        }
    },
    async deletePost(postId: string): Promise<boolean> {
        try {
            const result = await postsCollection.deleteOne({id: postId});

            return result.deletedCount === 1;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to delete a post');
        }
    },
    mapToViewModel(post: PostDbType): PostViewModel {
        return {
            id: post.id,
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

export {postsRepository};