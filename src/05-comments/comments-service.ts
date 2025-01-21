import {CommentInputModel} from "./types/input-output-types";
import {ObjectId, WithId} from "mongodb";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatus} from "../common/types/result-types/result-status";
import {PostDbType} from "../04-posts/types/post-db-type";
import {postsService} from "../04-posts/services/posts-service";
import {commentRepository} from "./repositoryes/comment-repository";
import {CommentDbType} from "./types/comment-db-type";
import {UserDbType} from "../02-users/types/user-db-type";
import {usersRepository} from "../02-users/repositoryes/users-repository";

const commentsService = {

    async createComment(data: CommentInputModel, postId: string, commentatorId: string): Promise<ResultType<string | null>> {

        const resultCheckPostId: ResultType<string | null> = await this._checkPostId(postId);

        if (resultCheckPostId.status !== ResultStatus.Success) return {
            status: ResultStatus.NotFound,
            errorMessage: 'there is no such post.',
            extensions: [{
                field: 'postId',
                message: 'There is no post with this ID.',
            }],
            data: null
        };

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

        return {
            status: ResultStatus.Created,
            extensions: [],
            data: String(result.insertedId)
        };
    },

    async updateComment(commentId: string, userId: string, data: CommentInputModel): Promise<ResultType> {

        const resultCheckingExistenceCommentAndOwner: ResultType = await this._checkingExistenceCommentAndOwner(commentId, userId);

        if (resultCheckingExistenceCommentAndOwner.status !== ResultStatus.Success) return resultCheckingExistenceCommentAndOwner;

        const updateResult: boolean = await commentRepository
            .updateComment(commentId, data);

        //TODO какой статус возвращать в этом случае???(!!!!!!!!500!!!!!!!!!!!)

        if (!updateResult) return {
            status: ResultStatus.NotFound,
            errorMessage: 'not found',
            extensions: [{
                field: 'id',
                message: 'No comment with this ID was found.'
            }],
            data: null
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null
        };
    },

    async deleteComment(commentId: string, userId: string): Promise<ResultType> {

        const resultCheckingExistenceCommentAndOwner: ResultType = await this._checkingExistenceCommentAndOwner(commentId, userId);

        if (resultCheckingExistenceCommentAndOwner.status !== ResultStatus.Success) return resultCheckingExistenceCommentAndOwner;

        const deleteResult: boolean = await commentRepository
            .deleteComment(commentId);

        //TODO какой статус возвращать в этом случае???(!!!!!!!!500!!!!!!!!!!!)

        if (!deleteResult) return {
            status: ResultStatus.NotFound,
            errorMessage: 'not found',
            extensions: [{
                field: 'id',
                message: 'No comment with this id was found.'
            }],
            data: null
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null
        }
    },

    async _checkPostId(postId: string): Promise<ResultType<string | null>> {

        if (!ObjectId.isValid(postId)) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'postId invalid',
            extensions: [{
                field: 'postId',
                message: 'Invalid ID format: The provided post ID is not a valid MongoDB ObjectId.',
            }],
            data: null
        };

        const isExistPost: WithId<PostDbType> | null = await postsService
            .findPost(postId);

        if (!isExistPost) return {
            status: ResultStatus.NotFound,
            errorMessage: 'there is no such post.',
            extensions: [{
                field: 'postId',
                message: 'There is no post with this ID.',
            }],
            data: null
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: String(isExistPost._id)
        };
    },

    //TODO нормально ли делать две проверки в одном методе?

    async _checkingExistenceCommentAndOwner( commentId: string, userId: string): Promise<ResultType> {

        const comment: WithId<CommentDbType> | null = await commentRepository
            .findComment(commentId);

        if (!comment) return {
            status: ResultStatus.NotFound,
            errorMessage: 'comment not found.',
            extensions: [{
                field: 'commentId',
                message: 'There is no comment with this ID.'
            }],
            data: null
        }

        if (comment.commentatorInfo.userId !== userId) return {
            status: ResultStatus.Forbidden,
            errorMessage: 'is not the owner.',
            extensions: [{
                field: 'userId',
                message: 'This user is not the owner of this comment.'
            }],
            data: null
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null
        };
    }
};

export {commentsService};