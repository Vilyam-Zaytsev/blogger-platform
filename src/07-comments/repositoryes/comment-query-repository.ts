import {CommentDbType} from "../types/comment-db-type";
import {ObjectId, Sort, WithId} from "mongodb";
import {commentsCollection} from "../../db/mongoDb";
import {CommentViewModel} from "../types/input-output-types";
import {
    PaginationAndSortFilterType,
    Paginator,
    SortDirection
} from "../../common/types/input-output-types/pagination-sort-types";

class CommentQueryRepository {

    async findComments(sortQueryDto: PaginationAndSortFilterType, postId: string): Promise<CommentViewModel[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        } = sortQueryDto;

        const comments: WithId<CommentDbType>[] | null = await commentsCollection
            .find({postId})
            .sort({[sortBy]: sortDirection === SortDirection.Ascending ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()

        return comments.map(c => this._mapDBCommentToViewModel(c));
    }

    async findComment(id: string): Promise<CommentViewModel | null> {

        const comment: WithId<CommentDbType> | null = await commentsCollection
            .findOne({_id: new ObjectId(id)});

        if (!comment) return null;

        return this._mapDBCommentToViewModel(comment);
    }

    async getCommentsCount(postId: string): Promise<number> {

        return await commentsCollection
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
        paginationAndSortFilter: PaginationAndSortFilterType
    ): Paginator<CommentViewModel> {

        return {
            pagesCount: Math.ceil(commentsCount / paginationAndSortFilter.pageSize),
            page: paginationAndSortFilter.pageNumber,
            pageSize: paginationAndSortFilter.pageSize,
            totalCount: commentsCount,
            items: comments
        }
    }
}

const commentQueryRepository: CommentQueryRepository = new CommentQueryRepository();

export {commentQueryRepository};