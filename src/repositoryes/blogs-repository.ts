import {BlogInputModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {blogsCollection} from "../db/mongoDb";
import {InsertOneResult, ObjectId, Sort, WithId} from "mongodb";
import {createFilter} from "../helpers/createFilter";

const blogsRepository = {
    // async findBlogs(
    //     pageNumber: number,
    //     pageSize: number,
    //     sortBy: string,
    //     sortDirection: 'asc' | 'desc',
    //     searchNameTerm: string | null,
    // ): Promise<WithId<BlogDbType>[]> {
    //     const filter: any = createFilter(
    //         {
    //             nameOfSearchField: 'name',
    //             searchNameTerm
    //         }
    //     );
    //
    //     return await blogsCollection
    //         .find(filter)
    //         .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
    //         .skip((pageNumber - 1) * pageSize)
    //         .limit(pageSize)
    //         .toArray()
    // },
    async insertBlog(newBlog: BlogDbType): Promise<InsertOneResult> {
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