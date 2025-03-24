import {BlogInputModel} from "../types/input-output-types";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {BlogDocument, BlogModel} from "../domain/blog-entity";

@injectable()
class BlogsRepository {

    async findBlog(id: string): Promise<BlogDocument | null> {

      return BlogModel
          .findById(id);
    }

    async saveBlog(blogDocument: BlogDocument): Promise<string> {

        const result =  await blogDocument
            .save();

        return String(result._id);
    }

    async updateBlog(id: string, data: BlogInputModel): Promise<boolean> {

        const result = await BlogModel
            .updateOne({_id: new ObjectId(id)}, {$set: {...data}})
            .exec();

        return result.matchedCount === 1;
    }

    async deleteBlog(id: string): Promise<boolean> {

        const result = await BlogModel
            .findByIdAndDelete(id)
            .exec();

        return !!result;
    }
}

export {BlogsRepository};