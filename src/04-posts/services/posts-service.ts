import {PostDbType} from "../types/post-db-type";
import {PostInputModel, PostViewModel} from "../types/input-output-types";
import {ObjectId, WithId} from "mongodb";
import {postsRepository} from "../repositoryes/posts-repository";
import {blogsQueryService} from "../../03-blogs/services/blogs-query-service";
import {BlogDbType} from "../../03-blogs/types/blog-db-type";
import {postsQueryRepository} from "../repositoryes/posts-query-repository";

const postsService = {
    async findPost(id: string): Promise<WithId<PostDbType> | null> {

        return await postsRepository
            .findPost(id);
    },
    async createPost(data: PostInputModel, blogId?: string): Promise<string | null> {

        if (blogId) {
            if (!ObjectId.isValid(blogId)) return null;

            const isExistBlog: BlogDbType | null = await blogsQueryService
                .findBlog(blogId);

            if (!isExistBlog) return null;

            data.blogId = blogId;
        }

        const newPost: PostDbType = {
            ...data,
            blogName: (await blogsQueryService.findBlog(data.blogId))!.name,
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