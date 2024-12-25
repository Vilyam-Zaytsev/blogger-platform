import {blogsRepository} from "../repositoryes/blogs-repository";
import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {InsertOneResult, ObjectId} from "mongodb";
import {blogsCollection} from "../db/mongoDb";


const blogsService = {
    async findBlogs(): Promise<BlogViewModel[] | []> {
        try {
            return await blogsRepository.findBlogs();
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch blogs');
        }
    },
    async findBlog(blogId: string): Promise<BlogViewModel | null> {
        try {
            return await blogsRepository.findBlog(blogId)
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch blog');
        }
    },
    async createBlog(blogData: BlogInputModel): Promise<InsertOneResult> {
        try {
            const newBlog: BlogDbType = {
                ...blogData,
                createdAt: new Date().toISOString(),
                isMembership: false,
            };

            const result: InsertOneResult = await blogsRepository.createBlog(newBlog);

            return result.insertedId;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to create a blog');
        }
    },
    async updateBlog(blogId: string, blogData: BlogInputModel): Promise<boolean> {
        try {
            return await blogsRepository.updateBlog(blogId, blogData);
        } catch (error) {
            console.error(error);
            throw new Error('Failed to update a blog')
        }
    },
    async deleteBlog(blogId: string): Promise<boolean> {
        try {
            return await blogsRepository.deleteBlog(blogId);
        } catch (error) {
            console.error(error);
            throw new Error('Failed to delete a blog')
        }
    },

};

export {blogsService};