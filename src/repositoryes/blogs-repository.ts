import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {blogsCollection} from "../db/mongoDb";

const blogsRepository = {
    async findBlogs(): Promise<BlogViewModel[] | []> {
        try {
            return await blogsCollection
                .find({}, {
                    projection: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        description: 1,
                        websiteUrl: 1,
                        createdAt: 1,
                        isMembership: 1,
                    }
                })
                .toArray() as BlogViewModel[];
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch blogs');
        }
    },
    async findBlog(blogId: string): Promise<BlogViewModel | null> {
        try {
            return await blogsCollection
                .findOne({id: blogId}, {
                    projection: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        description: 1,
                        websiteUrl: 1,
                        createdAt: 1,
                        isMembership: 1,
                    }
                });
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch blog');
        }
    },
    async createBlog(newBlog: BlogDbType){
        try {
            return  await blogsCollection.insertOne(newBlog);
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
    // async findBlogToDb(blogId: string): Promise<BlogDbType | null> {
    //     try {
    //         return await blogsCollection.findOne({id: blogId});
    //     } catch (error) {
    //         console.error(error);
    //         throw new Error('Failed to fetch blog');
    //     }
    // }
};

export {blogsRepository};