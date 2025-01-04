import {blogsRepository} from "../repositoryes/blogs-repository";
import {BlogInputModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";

const blogsService = {
    async createBlog(blogData: BlogInputModel): Promise<string> {

        const newBlog: BlogDbType = {
            ...blogData,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };

        const result =  await blogsRepository
            .insertBlog(newBlog);

        return String(result.insertedId);
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