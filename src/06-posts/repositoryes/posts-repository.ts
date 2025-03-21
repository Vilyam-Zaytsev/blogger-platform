import {PostDbType} from "../types/post-db-type";
import {PostInputModel} from "../types/input-output-types";
import {InsertOneResult, ObjectId, WithId} from "mongodb";
import {injectable} from "inversify";
import {PostDocument, PostModel} from "../../archive/models/post-model";

@injectable()
class PostsRepository {

    async findPost(id: string): Promise<WithId<PostDbType> | null> {

        return PostModel
            .findOne({_id: new ObjectId(id)})
            .lean();
    }

    async savePost(postDocument: PostDocument): Promise<PostDocument> {

            return  await postDocument
                .save();
    }

    async updatePost(id: string, data: PostInputModel): Promise<boolean> {

            const result = await PostModel
                .updateOne({_id: new ObjectId(id)}, {$set: {...data}})
                .exec();

            return result.matchedCount === 1;
    }

    async deletePost(id: string): Promise<boolean> {

            const result = await PostModel
                .deleteOne({_id: new ObjectId(id)})
                .exec();

            return result.deletedCount === 1;
    }
}

export {PostsRepository};