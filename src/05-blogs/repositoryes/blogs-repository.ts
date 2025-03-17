import {BlogInputModel} from "../types/input-output-types";
import {BlogDbType} from "../types/blog-db-type";
import {blogsCollection} from "../../db/mongo-db/mongoDb";
import {InsertOneResult, ObjectId} from "mongodb";
import {injectable} from "inversify";

@injectable()
class BlogsRepository {

    async findBlog(id: string): Promise<BlogDbType | null> {
      return await blogsCollection
          .findOne({_id: new ObjectId(id)});
    }

    async insertBlog(newBlog: BlogDbType): Promise<InsertOneResult> {

        return await blogsCollection
            .insertOne(newBlog);
    }

    async updateBlog(id: string, data: BlogInputModel): Promise<boolean> {

        const result = await blogsCollection
            .updateOne({_id: new ObjectId(id)}, {$set: {...data}});

        return result.matchedCount === 1;
    }

    async deleteBlog(id: string): Promise<boolean> {

        const result = await blogsCollection
            .deleteOne({_id: new ObjectId(id)});

        return result.deletedCount === 1;
    }
}

export {BlogsRepository};