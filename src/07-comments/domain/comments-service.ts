import {CommentInputModel} from "../types/input-output-types";
import {ObjectId, WithId} from "mongodb";
import {ResultType} from "../../common/types/result-types/result-type";
import {ResultStatus} from "../../common/types/result-types/result-status";
import {PostDbType} from "../../06-posts/types/post-db-type";
import {PostsService} from "../../06-posts/domain/posts-service";
import {CommentRepository} from "../repositoryes/comment-repository";
import {CommentDbType} from "../types/comment-db-type";
import {UsersRepository} from "../../04-users/repositoryes/users-repository";
import {
    BadRequestResult,
    ForbiddenResult,
    NotFoundResult,
    SuccessResult
} from "../../common/helpers/result-object";
import {User} from "../../04-users/domain/user-entity";
import {injectable} from "inversify";
import {CommentDocument, CommentModel} from "../../archive/models/comment-model";

@injectable()
class CommentsService {

    constructor(
        private usersRepository: UsersRepository,
        private postsService: PostsService,
        private commentRepository: CommentRepository
    ) {};

    async createComment(data: CommentInputModel, postId: string, commentatorId: string): Promise<ResultType<string | null>> {

        const resultCheckPostId: ResultType<string | null> = await this._checkPostId(postId);

        if (resultCheckPostId.status !== ResultStatus.Success) {

            return NotFoundResult
                .create(
                    'postId',
                    'A post with this ID does not exist.',
                    'Couldn\'t create a new comment entry.'
                );
        }

        const commentator: WithId<User> | null = await this.usersRepository
            .findUserById(commentatorId);

        const newComment: CommentDbType = {
            postId,
            ...data,
            commentatorInfo: {
                userId: String(commentator!._id),
                userLogin: commentator!.login
            },
            createdAt: new Date().toISOString()
        };

        const commentDocument: CommentDocument = new CommentModel(newComment);

        const resultSaveComment: CommentDocument = await this.commentRepository
            .saveComment(commentDocument);

        return SuccessResult
            .create<string>(String(resultSaveComment._id));
    }

    async updateComment(commentId: string, userId: string, data: CommentInputModel): Promise<ResultType> {

        const resultCheckingExistenceCommentAndOwner: ResultType = await this._checkingExistenceCommentAndOwner(commentId, userId);

        if (resultCheckingExistenceCommentAndOwner.status !== ResultStatus.Success) {

            return resultCheckingExistenceCommentAndOwner;
        }

        await this.commentRepository
            .updateComment(commentId, data);

        return SuccessResult
            .create(null);
    }

    async deleteComment(commentId: string, userId: string): Promise<ResultType> {

        const resultCheckingExistenceCommentAndOwner: ResultType = await this._checkingExistenceCommentAndOwner(commentId, userId);

        if (resultCheckingExistenceCommentAndOwner.status !== ResultStatus.Success) return resultCheckingExistenceCommentAndOwner;

        await this.commentRepository
            .deleteComment(commentId);

        return SuccessResult
            .create(null);
    }

    async _checkPostId(postId: string): Promise<ResultType<string | null>> {

        if (!ObjectId.isValid(postId)) {

            return BadRequestResult
                .create(
                    'postId',
                    'Invalid ID format: The provided post ID is not a valid MongoDB ObjectId.',
                    'The postId field failed verification.'
                );
        }

        const isExistPost: WithId<PostDbType> | null = await this.postsService
            .findPost(postId);

        if (!isExistPost) {

            return NotFoundResult
                .create(
                    'postId',
                    'There is no post with this ID.',
                    'The postId field failed verification.'
                );
        }

        return SuccessResult
            .create<string>(String(isExistPost._id));
    }

    async _checkingExistenceCommentAndOwner(commentId: string, userId: string): Promise<ResultType> {

        const comment: WithId<CommentDbType> | null = await this.commentRepository
            .findComment(commentId);

        if (!comment) {

            return NotFoundResult
                .create(
                    'commentId',
                    'A comment with this ID does not exist.',
                    'The commentId field failed validation.'
                );
        }

        if (comment.commentatorInfo.userId !== userId) {

            return ForbiddenResult
                .create(
                    'userId',
                    'The user does not have permission to edit this comment.',
                    'The userId field failed validation.'
                );
        }

        return SuccessResult
            .create(null);
    }
}

export {CommentsService};