import {CommentDbType} from "../types/comment-db-type";
import {InsertOneResult} from "mongodb";
import {commentsCollection} from "../../db/mongoDb";

const commentRepository = {
    async insertComment(newComment: CommentDbType): Promise<InsertOneResult> {
        return await commentsCollection
            .insertOne(newComment);
    }
};

export {commentRepository};