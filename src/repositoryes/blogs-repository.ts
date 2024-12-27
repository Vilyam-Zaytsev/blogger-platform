import {BlogInputModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {blogsCollection} from "../db/mongoDb";
import {InsertOneResult, ObjectId, WithId} from "mongodb";
import {blogsService} from "../services/blogs-service";
import {blogsController} from "../controllers/blogsController";

const blogsRepository = {
    async findBlogs(
        searchNameTerm,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    ): Promise<WithId<BlogDbType>[]> {
        const search = searchNameTerm
            ? {name: {$regex: searchNameTerm, $options: 'i'}}
            : {}
        const filter: any = {
            ...search
        };

        return await blogsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },
    async getBlogsCount(searchNameTerm: string | null): Promise<number> {
        const search = searchNameTerm
            ? {name: {$regex: searchNameTerm, $options: 'i'}}
            : {}
        const filter: any = {
            ...search
        };

        return blogsCollection.countDocuments(filter);
    },
    async createBlog(newBlog: BlogDbType): Promise<InsertOneResult> {
        return await blogsCollection
            .insertOne(newBlog);
    },
    async updateBlog(id: string, data: BlogInputModel): Promise<boolean> {
        const result = await blogsCollection
            .updateOne({_id: new ObjectId(id)}, {$set: {...data}});

        return result.matchedCount === 1;
    },
    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsCollection
            .deleteOne({_id: new ObjectId(id)});

        return result.deletedCount === 1;
    },
};

export {blogsRepository};