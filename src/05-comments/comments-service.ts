import {CommentInputModel} from "./types/input-output-types";
import {ObjectId, WithId} from "mongodb";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatusType} from "../common/types/result-types/result-status-type";
import {PostDbType} from "../04-posts/types/post-db-type";
import {postsService} from "../04-posts/services/posts-service";

const commentsService = {
    async createComment(data: CommentInputModel, postId: string): Promise<ResultType<string | null>> {

        const resultCheckPostId: ResultType<string | null> = await this.checkPostId(postId);

        if (resultCheckPostId.status !== ResultStatusType.Success) return resultCheckPostId;

//остановился здесь
    },
    async checkPostId(postId: string): Promise<ResultType<string | null>> {

        if (!ObjectId.isValid(postId)) return {
            status: ResultStatusType.BadRequest,
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
            status: ResultStatusType.NotFound,
            errorMessage: 'there is no such post.',
            extensions: [{
                field: 'postId',
                message: 'There is no post with this ID.',
            }],
            data: null
        }

        return {
            status: ResultStatusType.Success,
            extensions: [],
            data: String(isExistPost._id)
        };
    }
};

export {commentsService};