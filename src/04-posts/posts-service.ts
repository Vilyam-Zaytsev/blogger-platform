import {PostDbType} from "./types/post-db-type";
import {PostInputModel} from "./types/input-output-types";
import {WithId} from "mongodb";
import {postsRepository} from "./repositoryes/posts-repository";
import {blogsRepository} from "../03-blogs/repositoryes/blogs-repository";

const postsService = {
    async findPost(id: string): Promise<WithId<PostDbType> | null> {

        return await postsRepository
            .findPost(id);
    },

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