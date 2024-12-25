import {BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {blogsCollection} from "../db/mongoDb";
import {ObjectId, WithId} from "mongodb";

const qBlogsRepository = {
    async findBlogs(): Promise<WithId<BlogDbType>[]> {
        return await blogsCollection
            .find({})
            .toArray();
    },
    async findBlog(id: string): Promise<WithId<BlogDbType> | null> {
        return await blogsCollection
            .findOne({_id: new ObjectId(id)});
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
    async findBlogAndMapToViewModel(id: ObjectId): Promise<BlogViewModel> {
        const blog: WithId<BlogDbType> = await blogsCollection
            .findOne({_id: new ObjectId(id)}) as WithId<BlogDbType>;

        return this.mapToViewModel(blog);
    },
    async findBlogsAndMapToViewModel(): Promise<BlogViewModel[]> {
        return (await blogsCollection
            .find({})
            .toArray())
            .map(b => this.mapToViewModel(b));
    },
};

export {qBlogsRepository};