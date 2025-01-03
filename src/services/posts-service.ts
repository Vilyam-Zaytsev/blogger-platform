import {PostDbType} from "../types/db-types/post-db-type";
import {PostInputModel} from "../types/input-output-types/posts-types";
import {InsertOneResult} from "mongodb";
import {qBlogsRepository} from "../repositoryes/qBlogs-repository";
import {postsRepository} from "../repositoryes/posts-repository";

const postsService = {
    async createPost(data: PostInputModel): Promise<InsertOneResult> {

        const newPost: PostDbType = {
            ...data,
            blogName: (await qBlogsRepository.findBlog(data.blogId))!.name,
            createdAt: new Date().toISOString(),
        }

        return await postsRepository
            .insertPost(newPost);
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