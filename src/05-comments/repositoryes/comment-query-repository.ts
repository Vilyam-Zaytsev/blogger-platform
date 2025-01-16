import {CommentDbType} from "../types/comment-db-type";
import {ObjectId, WithId} from "mongodb";
import {commentsCollection} from "../../db/mongoDb";
import {CommentViewModel} from "../types/input-output-types";

const commentQueryRepository = {
    async findComment(id: string): Promise<CommentViewModel> {
        const comment: WithId<CommentDbType> | null = await commentsCollection
            .findOne({_id: new ObjectId(id)});

        return this.mapToViewModel(comment!);
    },

    mapToViewModel(comment: WithId<CommentDbType>): CommentViewModel {
        return {
            id: String(comment._id),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: comment.createdAt
        };
    }
};

export {commentQueryRepository};