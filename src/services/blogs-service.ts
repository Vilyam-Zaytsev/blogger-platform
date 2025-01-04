import {blogsRepository} from "../repositoryes/blogs-repository";
import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {InsertOneResult, ObjectId, WithId} from "mongodb";
import {qBlogsRepository} from "../repositoryes/qBlogs-repository";

const blogsService = {
    // async findBlog(id: string): Promise<BlogDbType | null> {
    //
    //     const foundBlog: WithId<BlogDbType> | null = await blogsRepository
    //         .findBlog(id);
    //
    //     if (!foundBlog) return null;
    //
    //     return foundBlog;
    // },
    //
    async createBlog(blogData: BlogInputModel): Promise<InsertOneResult> {

        const newBlog: BlogDbType = {
            ...blogData,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };

        return await blogsRepository
            .insertBlog(newBlog);
    },
    async updateBlog(id: string, data: BlogInputModel): Promise<boolean> {
        return await blogsRepository
            .updateBlog(id, data);
    },
    async deleteBlog(id: string): Promise<boolean> {
        return await blogsRepository
            .deleteBlog(id);
    },

};

export {blogsService};