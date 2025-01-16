import {CommentDbType} from "../types/comment-db-type";
import {ObjectId, WithId} from "mongodb";
import {commentsCollection} from "../../db/mongoDb";
import {CommentViewModel} from "../types/input-output-types";
import {
    PaginationAndSortFilterType,
    PaginationResponse
} from "../../common/types/input-output-types/pagination-sort-types";

const commentQueryRepository = {

    async findComments(sortQueryDto: PaginationAndSortFilterType, postId: string): Promise<WithId<CommentDbType> | null> {

        const comment: WithId<CommentDbType> | null = await commentsCollection
            .findOne({_id: new ObjectId(id)});

        return this.mapToViewModel(comment!);
    },

    async findComment(id: string): Promise<WithId<CommentDbType> | null> {

        return  await commentsCollection
            .findOne({_id: new ObjectId(id)});
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