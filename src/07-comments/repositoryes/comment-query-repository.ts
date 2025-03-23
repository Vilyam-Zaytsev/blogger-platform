import {CommentDbType} from "../types/comment-db-type";
import {ObjectId, WithId} from "mongodb";
import {CommentViewModel} from "../types/input-output-types";
import {Paginator} from "../../common/types/input-output-types/pagination-sort-types";
import {CommentModel} from "../../archive/models/comment-model";
import {SortOptionsType} from "../../04-users/types/sort-options-type";
import {SortDirection, SortQueryDto} from "../../common/helpers/sort-query-dto";

class CommentQueryRepository {

    async findComments(sortQueryDto: SortQueryDto, postId: string): Promise<CommentViewModel[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        } = sortQueryDto;

        const comments: WithId<CommentDbType>[] | null = await CommentModel
            .find({postId})
            .sort({[sortBy]: sortDirection === SortDirection.Ascending ? 1 : -1} as SortOptionsType)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        return comments.map(c => this._mapDBCommentToViewModel(c));
    }

    async findComment(id: string): Promise<CommentViewModel | null> {

        const comment: WithId<CommentDbType> | null = await CommentModel
            .findOne({_id: new ObjectId(id)})
            .exec();

        if (!comment) return null;

        return this._mapDBCommentToViewModel(comment);
    }

    async getCommentsCount(postId: string): Promise<number> {

        return CommentModel
            .countDocuments({postId})
    }

    _mapDBCommentToViewModel(comment: WithId<CommentDbType>): CommentViewModel {

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

    _mapCommentsViewModelToPaginationResponse(
        comments: CommentViewModel[],
        commentsCount: number,
        sortQueryDto: SortQueryDto
    ): Paginator<CommentViewModel> {

        return {
            pagesCount: Math.ceil(commentsCount / sortQueryDto.pageSize),
            page: sortQueryDto.pageNumber,
            pageSize: sortQueryDto.pageSize,
            totalCount: commentsCount,
            items: comments
        }
    }
}

export {CommentQueryRepository};