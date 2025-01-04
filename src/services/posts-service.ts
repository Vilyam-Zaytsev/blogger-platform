import {PostDbType} from "../types/db-types/post-db-type";
import {PostInputModel} from "../types/input-output-types/posts-types";
import {ObjectId} from "mongodb";
import {postsRepository} from "../repositoryes/posts-repository";
import {qBlogsService} from "./qBlogs-service";
import {BlogDbType} from "../types/db-types/blog-db-type";

const postsService = {
    async createPost(data: PostInputModel, blogId?: string): Promise<string | null> {

        if (blogId) {
            if (!ObjectId.isValid(blogId)) return null;

            const isExistBlog: BlogDbType | null = await qBlogsService
                .findBlog(blogId);

            if (!isExistBlog) return null;

            data.blogId = blogId;
        }

        const newPost: PostDbType = {
            ...data,
            blogName: (await qBlogsService.findBlog(data.blogId))!.name,
            createdAt: new Date().toISOString(),
        }

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