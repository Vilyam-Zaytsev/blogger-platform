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
import {BadRequestResult, ResultObject, SuccessResult} from "../common/helpers/result-object";

const commentsService = {

    async createComment(data: CommentInputModel, postId: string, commentatorId: string): Promise<ResultType<string | null>> {

        const resultCheckPostId: ResultType<string | null> = await this._checkPostId(postId);

        //TODO:**********************************
        if (resultCheckPostId.status !== ResultStatus.Success) return BadRequestResult
            .create(
                'commentId',
                'Invalid ID format: The provided post ID is not a valid MongoDB ObjectId.',
                'postId invalid.'
            );
        // ResultObject
        //     .negative(
        //         ResultStatus.NotFound,
        //         'postId',
        //         'There is no post with this ID.'
        //     );

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

        return SuccessResult
            .create<string>(String(result.insertedId));
    },

    async updateComment(commentId: string, userId: string, data: CommentInputModel): Promise<ResultType> {

        const resultCheckingExistenceCommentAndOwner: ResultType = await this._checkingExistenceCommentAndOwner(commentId, userId);

        if (resultCheckingExistenceCommentAndOwner.status !== ResultStatus.Success) return resultCheckingExistenceCommentAndOwner;

        await commentRepository
            .updateComment(commentId, data);

        return SuccessResult
            .create(null);
    },

    async deleteComment(commentId: string, userId: string): Promise<ResultType> {

        const resultCheckingExistenceCommentAndOwner: ResultType = await this._checkingExistenceCommentAndOwner(commentId, userId);

        if (resultCheckingExistenceCommentAndOwner.status !== ResultStatus.Success) return resultCheckingExistenceCommentAndOwner;

        await commentRepository
            .deleteComment(commentId);

        return SuccessResult
            .create(null);
    },

    async _checkPostId(postId: string): Promise<ResultType<string | null>> {

        if (!ObjectId.isValid(postId)) return BadRequestResult
            .create(
                'postId',
                'Invalid ID format: The provided post ID is not a valid MongoDB ObjectId.',
                'postId invalid.'
            );

        const isExistPost: WithId<PostDbType> | null = await postsService
            .findPost(postId);

        if (!isExistPost) return BadRequestResult
            .create(
                'postId',
                'There is no post with this ID.',
                'postId incorrect.'
            );

        return SuccessResult
            .create<string>(String(isExistPost._id));
    },

    async _checkingExistenceCommentAndOwner(commentId: string, userId: string): Promise<ResultType> {

        const comment: WithId<CommentDbType> | null = await commentRepository
            .findComment(commentId);

        //TODO:********************************
        if (!comment) return BadRequestResult
            .create(
                'commentId',
                'Invalid ID format: The provided post ID is not a valid MongoDB ObjectId.',
                'postId invalid.'
            );
        // ResultObject
        //     .negative(
        //         ResultStatus.NotFound,
        //         'commentId',
        //         'There is no comment with this ID.'
        //     );

        if (comment.commentatorInfo.userId !== userId) return BadRequestResult
            .create(
                'commentId',
                'Invalid ID format: The provided post ID is not a valid MongoDB ObjectId.',
                'postId invalid.'
            );
        // ResultObject
        //     .negative(
        //         ResultStatus.Forbidden,
        //         'userId',
        //         'This user is not the owner of this comment.'
        //     );

        return SuccessResult
            .create(null);
    }
};

export {commentsService};