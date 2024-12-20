import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {blogsCollection} from "../db/mongoDb";
import {ObjectId} from "mongodb";

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
    async findBlogById(blogId: string): Promise<BlogViewModel | null> {
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
    async createBlog(blogData: BlogInputModel): Promise<BlogViewModel> {
        try {
            const newBlog: BlogDbType = {
                _id: new ObjectId(),
                id: String(Math.floor(Date.now() + Math.random())),
                ...blogData,
                createdAt: new Date().toISOString(),
                isMembership: false,
            };

            await blogsCollection.insertOne(newBlog);

            return this.mapToViewModel(newBlog);
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
    async deleteBlogById(blogId: string): Promise<boolean> {
        try {
            const result = await blogsCollection.deleteOne({id: blogId});

            return result.deletedCount === 1;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to delete a blog')
        }
    },
    mapToViewModel(blog: BlogDbType): BlogViewModel {
        return  {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        };
    },
    // async findBlogToDb(blogId: string): BlogDbType | undefined {
    //     return db.blogs
    //         .find(b => b.id === blogId);
    // }
};

export {blogsRepository};