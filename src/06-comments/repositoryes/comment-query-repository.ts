import {WithId} from "mongodb";
import {Paginator} from "../../common/types/input-output-types/pagination-sort-types";
import {SortOptionsType} from "../../common/types/sort-options-type";
import {SortDirection, SortQueryDto} from "../../common/helpers/sort-query-dto";
import {Comment, CommentModel, CommentViewModel} from "../domain/comment-entity";
import {LikeDocument, LikeStatus} from "../../07-likes/like-entity";
import {LikeRepository} from "../../07-likes/repositoryes/like-repository";
import {injectable} from "inversify";

@injectable()
class CommentQueryRepository {

    constructor(
        private likeRepository: LikeRepository
    ) {};

    async findComments(
        sortQueryDto: SortQueryDto,
        postId: string,
        userId: string | null
    ): Promise<CommentViewModel[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        } = sortQueryDto;

        const comments: WithId<Comment>[] = await CommentModel
            .find({postId})
            .sort({[sortBy]: sortDirection === SortDirection.Ascending ? 1 : -1} as SortOptionsType)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        let likes: LikeDocument[] = [];

        if (userId) {

            likes = await this.likeRepository
                .findLikesByUserId(userId)
        }

        return comments.map((c) => {

            const foundLike: LikeDocument | undefined = likes.find(l => l.parentId === String(c._id));

            const userReaction: LikeStatus = foundLike ? foundLike.status : LikeStatus.None;

            return this._mapDBCommentToViewModel(c, userReaction);
        });
    }

    async findComment(commentId: string, userId: string | null): Promise<CommentViewModel | null> {

        const comment: WithId<Comment> | null = await CommentModel
            .findById(commentId)
            .exec();

        if (!comment) return null;

        let like: LikeDocument | null = null;

        if (userId) {

            like = await this.likeRepository
                .findLikeByUserIdAndParentId(userId, commentId)
        }

        const userReaction: LikeStatus = like ? like.status : LikeStatus.None;

        return this._mapDBCommentToViewModel(comment, userReaction);
    }

    async getCommentsCount(postId: string): Promise<number> {

        return CommentModel
            .countDocuments({postId})
    }

    _mapDBCommentToViewModel(
        comment: WithId<Comment>,
        userReaction: LikeStatus
    ): CommentViewModel {

        return {
            id: String(comment._id),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            likesInfo: {
                likesCount: comment.reactions.likeCount,
                dislikesCount: comment.reactions.dislikeCount,
                myStatus: userReaction
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