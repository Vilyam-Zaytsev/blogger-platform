import {PostDbType} from "../types/post-db-type";
import {PostInputModel} from "../types/input-output-types";
import {ObjectId, WithId} from "mongodb";
import {postsRepository} from "../repositoryes/posts-repository";
import {BlogDbType} from "../../03-blogs/types/blog-db-type";
import {blogsQueryRepository} from "../../03-blogs/repositoryes/blogs-query-repository";
import {blogsRepository} from "../../03-blogs/repositoryes/blogs-repository";

const postsService = {
    async findPost(id: string): Promise<WithId<PostDbType> | null> {

        return await postsRepository
            .findPost(id);
    },

    // async createPost(data: PostInputModel, blogId?: string): Promise<string | null> {
    //
    //     if (blogId) {
    //         if (!ObjectId.isValid(blogId)) return null;
    //
    //         const isExistBlog: BlogDbType | null = await blogsQueryRepository
    //             .findBlog(blogId);
    //
    //         if (!isExistBlog) return null;
    //
    //         data.blogId = blogId;
    //     }
    //
    //     const newPost: PostDbType = {
    //         ...data,
    //         blogName: (await blogsQueryRepository.findBlog(data.blogId))!.name,
    //         createdAt: new Date().toISOString(),
    //     };
    //
    //     const result = await postsRepository
    //         .insertPost(newPost);
    //
    //     return String(result.insertedId);
    // },

    async createPost(data: PostInputModel): Promise<string> {

        const newPost: PostDbType = {
            ...data,
            blogName: (await blogsRepository.findBlog(data.blogId))!.name,
            createdAt: new Date().toISOString(),
        };

        const result = await postsRepository
            .insertPost(newPost);

        return String(result.insertedId);
    },

    async updatePost(id: string, data: PostInputModel): Promise<boolean> {

        return await postsRepository
            .updatePost(id, data);
    },

    async deletePost(id: string): Promise<boolean> {

        return await postsRepository
            .deletePost(id);
    },
};

export {postsService};