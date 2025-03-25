import {PostInputModel} from "../types/input-output-types";
import {ObjectId, WithId} from "mongodb";
import {injectable} from "inversify";
import {Post, PostDocument, PostModel} from "../domain/post-entity";

@injectable()
class PostsRepository {

    async findPost(id: string): Promise<PostDocument | null> {

        return PostModel
            .findById(id);
    }

    async savePost(postDocument: PostDocument): Promise<string> {

            const result = await postDocument
                .save();

            return String(result._id);
    }

    async updatePost(id: string, postDto: PostInputModel): Promise<boolean> {

            const result = await PostModel
                .updateOne({_id: new ObjectId(id)}, {$set: {...postDto}})
                .exec();

            return result.matchedCount === 1;
    }

    async deletePost(id: string): Promise<boolean> {

            const result: PostDocument | null = await PostModel
                .findByIdAndDelete(id);

            return !!result;
    }
}

export {PostsRepository};