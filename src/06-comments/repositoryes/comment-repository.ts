import {ObjectId, WithId} from "mongodb";
import {CommentInputModel} from "../types/input-output-types";
import {injectable} from "inversify";
import {CommentDocument, CommentModel} from "../domain/comment-entity";

@injectable()
class CommentRepository {

    async findComment(id: string): Promise<CommentDocument | null> {

        return CommentModel
            .findById(id);
    }

    async saveComment(commentDocument: CommentDocument): Promise<string> {

        const result =  await commentDocument
            .save();

        return String(result._id);
    }

    async updateComment(id: string, data: CommentInputModel): Promise<boolean> {

        const result = await CommentModel
            .updateOne({_id: new ObjectId(id)}, {$set: {...data}})
            .exec();

        return result.matchedCount === 1;
    }

    async deleteComment(id: string): Promise<boolean> {

        const result: CommentDocument | null = await CommentModel
            .findByIdAndDelete(id)

        return !!result;
    }
}

export {CommentRepository};