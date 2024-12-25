import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {blogsCollection} from "../db/mongoDb";
import {WithId} from "mongodb";

const qBlogsRepository = {
    async findBlogs(): Promise<WithId<BlogDbType>[]> {
            return await blogsCollection
                .find({})
                .toArray();
    },
    // async findBlog(id: string): Promise<BlogViewModel | null> {
    //     try {
    //         return await blogsCollection
    //             .findOne({_id: id});
    //     } catch (error) {
    //         console.error(error);
    //         throw new Error('Failed to fetch blog');
    //     }
    // },
    async findBlogToDb(blogId: string): Promise<BlogDbType | null> {
        try {
            return await blogsCollection.findOne({id: blogId});
        } catch (error) {
            console.error(error);
            throw new Error('Failed to fetch blog');
        }
    },
    mapToViewModel(blog: WithId<BlogDbType>): BlogViewModel {
        return {
            id: String(blog._id),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        };
    },
    async findAndMapToViewModel(id): BlogViewModel {
        const blog: WithId<BlogDbType> | null = await blogsCollection
            .findOne({_id: id});

        if (!blog) return null;

        return {
            id: String(blog._id),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        };
    },
};

export {qBlogsRepository};