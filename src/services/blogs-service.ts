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
    async createBlog(blogData: BlogInputModel): Promise<BlogViewModel> {
        try {
            const newBlog: BlogDbType = {
                _id: new ObjectId(),
                id: String(Math.floor(Date.now() + Math.random())),
                ...blogData,
                createdAt: new Date().toISOString(),
                isMembership: false,
            };

            const result= await blogsRepository.createBlog(newBlog);

            if (result.acknowledged) return this.mapToViewModel(newBlog);
        } catch (error) {
            console.error(error);
            throw new Error('Failed to create a blog');
        }
    },
    async updateBlog(blogId: string, blogData: BlogInputModel): Promise<boolean> {
        try {
            const result = await blogsCollection.updateOne({id: blogId}, {$set: {...blogData}});

            return result.matchedCount === 1;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to update a blog')
        }
    },
    async deleteBlog(blogId: string): Promise<boolean> {
        try {
            const result = await blogsCollection.deleteOne({id: blogId});

            return result.deletedCount === 1;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to delete a blog')
        }
    },

    async findBlogToDb(blogId: string): Promise<BlogDbType | null> {
        try {
            return await blogsCollection.findOne({id: blogId});
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch blog');
        }
    }
};

export {blogsService};