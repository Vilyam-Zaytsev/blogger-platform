import {CommentDbType} from "../types/comment-db-type";
import {InsertOneResult} from "mongodb";

const commentRepository = {
    async insertComment(newComment: CommentDbType): Promise<InsertOneResult> {
        // return await comm
    }
}