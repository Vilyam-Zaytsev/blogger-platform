import {blogsRepository} from "../repositoryes/blogs-repository";
import {BlogInputModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {InsertOneResult} from "mongodb";


const blogsService = {
    async createBlog(blogData: BlogInputModel): Promise<InsertOneResult> {
        const newBlog: BlogDbType = {
            ...blogData,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };

        return await blogsRepository
            .createBlog(newBlog);
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