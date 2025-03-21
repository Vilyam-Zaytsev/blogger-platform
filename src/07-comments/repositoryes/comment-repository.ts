import {CommentDbType} from "../types/comment-db-type";
import {InsertOneResult, ObjectId, WithId} from "mongodb";
import {commentsCollection} from "../../db/mongoDb";
import {CommentInputModel} from "../types/input-output-types";
import {injectable} from "inversify";

@injectable()
class CommentRepository {

    async findComment(id: string): Promise<WithId<CommentDbType> | null> {

        return  await commentsCollection
            .findOne({_id: new ObjectId(id)});
    }

    async insertComment(newComment: CommentDbType): Promise<InsertOneResult> {
        return await commentsCollection
            .insertOne(newComment);
    }

    async updateComment(id: string, data: CommentInputModel): Promise<boolean> {
        const result = await commentsCollection
            .updateOne({_id: new ObjectId(id)}, {$set: {...data}});

        return result.matchedCount === 1;
    }

    async deleteComment(id: string): Promise<boolean> {
        const result = await commentsCollection
            .deleteOne({_id: new ObjectId(id)});

        return result.deletedCount === 1;
    }
}

export {CommentRepository};