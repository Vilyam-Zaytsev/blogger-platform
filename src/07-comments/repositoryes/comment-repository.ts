import {CommentDbType} from "../types/comment-db-type";
import {InsertOneResult, ObjectId, WithId} from "mongodb";
import {CommentInputModel} from "../types/input-output-types";
import {injectable} from "inversify";
import {CommentDocument, CommentModel} from "../../db/mongo-db/models/comment-model";

@injectable()
class CommentRepository {

    async findComment(id: string): Promise<WithId<CommentDbType> | null> {

        return CommentModel
            .findOne({_id: new ObjectId(id)})
            .lean();
    }

    async saveComment(commentDocument: CommentDocument): Promise<CommentDocument> {

        return await commentDocument
            .save();
    }

    async updateComment(id: string, data: CommentInputModel): Promise<boolean> {

        const result = await CommentModel
            .updateOne({_id: new ObjectId(id)}, {$set: {...data}})
            .exec();

        return result.matchedCount === 1;
    }

    async deleteComment(id: string): Promise<boolean> {

        const result = await CommentModel
            .deleteOne({_id: new ObjectId(id)})
            .exec();

        return result.deletedCount === 1;
    }
}

export {CommentRepository};