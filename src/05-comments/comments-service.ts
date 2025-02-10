import {CommentInputModel} from "./types/input-output-types";
import {ObjectId, WithId} from "mongodb";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatus} from "../common/types/result-types/result-status";
import {PostDbType} from "../04-posts/types/post-db-type";
import {postsService} from "../04-posts/posts-service";
import {commentRepository} from "./repositoryes/comment-repository";
import {CommentDbType} from "./types/comment-db-type";
import {UserDbType} from "../02-users/types/user-db-type";
import {usersRepository} from "../02-users/repositoryes/users-repository";
import {ResultObject} from "../common/helpers/result-object";

const commentsService = {

    async createComment(data: CommentInputModel, postId: string, commentatorId: string): Promise<ResultType<string | null>> {

        const resultCheckPostId: ResultType<string | null> = await this._checkPostId(postId);

        if (resultCheckPostId.status !== ResultStatus.Success) return ResultObject
            .negative(
                ResultStatus.NotFound,
                'postId',
                'There is no post with this ID.'
            );

        const commentator: WithId<UserDbType> | null = await usersRepository
            .findUser(commentatorId);

        const newComment: CommentDbType = {
            postId,
            ...data,
            commentatorInfo: {
                userId: String(commentator!._id),
                userLogin: commentator!.login
            },
            createdAt: new Date().toISOString()
        }

        const result = await commentRepository
            .insertComment(newComment);

        return ResultObject
            .positive<string>(
                ResultStatus.Success,
                String(result.insertedId)
            );
    },

    async updateComment(commentId: string, userId: string, data: CommentInputModel): Promise<ResultType> {

        const resultCheckingExistenceCommentAndOwner: ResultType = await this._checkingExistenceCommentAndOwner(commentId, userId);

        if (resultCheckingExistenceCommentAndOwner.status !== ResultStatus.Success) return resultCheckingExistenceCommentAndOwner;

        await commentRepository
            .updateComment(commentId, data);

        return ResultObject
            .positive(ResultStatus.Success);
    },

    async deleteComment(commentId: string, userId: string): Promise<ResultType> {

        const resultCheckingExistenceCommentAndOwner: ResultType = await this._checkingExistenceCommentAndOwner(commentId, userId);

        if (resultCheckingExistenceCommentAndOwner.status !== ResultStatus.Success) return resultCheckingExistenceCommentAndOwner;

        await commentRepository
            .deleteComment(commentId);

        return ResultObject
            .positive(ResultStatus.Success);
    },

    async _checkPostId(postId: string): Promise<ResultType<string | null>> {

        if (!ObjectId.isValid(postId)) return ResultObject
            .negative(
                ResultStatus.BadRequest,
                'postId',
                'Invalid ID format: The provided post ID is not a valid MongoDB ObjectId.'
            );

        const isExistPost: WithId<PostDbType> | null = await postsService
            .findPost(postId);

        if (!isExistPost) return ResultObject
            .negative(
                ResultStatus.NotFound,
                'postId',
                'There is no post with this ID.'
            );

        return ResultObject
            .positive<string>(
                ResultStatus.Success,
                String(isExistPost._id)
            );
    },

    async _checkingExistenceCommentAndOwner(commentId: string, userId: string): Promise<ResultType> {

        const comment: WithId<CommentDbType> | null = await commentRepository
            .findComment(commentId);

        if (!comment) return ResultObject
            .negative(
                ResultStatus.NotFound,
                'commentId',
                'There is no comment with this ID.'
            );

        if (comment.commentatorInfo.userId !== userId) return ResultObject
            .negative(
                ResultStatus.Forbidden,
                'userId',
                'This user is not the owner of this comment.'
            );

        return ResultObject
            .positive(ResultStatus.Success);
    }
};

export {commentsService};