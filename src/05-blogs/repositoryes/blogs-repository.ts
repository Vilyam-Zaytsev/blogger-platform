import {BlogInputModel} from "../types/input-output-types";
import {BlogDbType} from "../types/blog-db-type";
import {InsertOneResult, ObjectId} from "mongodb";
import {injectable} from "inversify";
import {BlogDocument, BlogModel} from "../../db/mongo-db/models/blog-model";

@injectable()
class BlogsRepository {

    async findBlog(id: string): Promise<BlogDbType | null> {
      return BlogModel
          .findOne({_id: new ObjectId(id)})
          .lean();
    }

    async saveBlog(blogDocument: BlogDocument): Promise<BlogDocument> {

        return await blogDocument
            .save();
    }

    async updateBlog(id: string, data: BlogInputModel): Promise<boolean> {

        const result = await BlogModel
            .updateOne({_id: new ObjectId(id)}, {$set: {...data}})
            .exec();

        return result.matchedCount === 1;
    }

    async deleteBlog(id: string): Promise<boolean> {

        const result = await BlogModel
            .deleteOne({_id: new ObjectId(id)})
            .exec();

        return result.deletedCount === 1;
    }
}

export {BlogsRepository};