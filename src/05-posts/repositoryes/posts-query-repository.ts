import {WithId} from "mongodb";
import {Paginator} from "../../common/types/input-output-types/pagination-sort-types";
import {injectable} from "inversify";
import {SortOptionsType} from "../../common/types/sort-options-type";
import {SortQueryDto} from "../../common/helpers/sort-query-dto";
import {Post, PostDocument, PostModel, PostViewModel} from "../domain/post-entity";
import {LikeDocument, LikeStatus} from "../../07-likes/like-entity";
import {LikesRepository} from "../../07-likes/repositoryes/likes-repository";
import {UserDocument} from "../../03-users/domain/user-entity";
import {UsersRepository} from "../../03-users/repositoryes/users-repository";

@injectable()
class PostsQueryRepository {

    constructor(
        private likesRepository: LikesRepository,
        private usersRepository: UsersRepository
    ) {
    };

    async findPosts(
        sortQueryDto: SortQueryDto,
        userId: string | null,
        blogId?: string
    ): Promise<PostViewModel[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        } = sortQueryDto;

        let filter: any = {};

        blogId
            ? filter = {blogId}
            : {};

        const posts: PostDocument[] = await PostModel
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as SortOptionsType)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        const postsIds: string[] = posts.map(p => String(p._id));

        const allLikesPosts: LikeDocument[] = await this.likesRepository
            .findAllLikes(postsIds);

        const idsOfRecentUsersWhoHaveLiked: string[] = [];

        let recentLikers: UserDocument[] = [];

        const usersReactionsForPosts: Record<string, LikeStatus> = {};

        const likesGroupedByPostId: Record<string, LikeDocument[]> = {};

        for (const like of allLikesPosts) {

            const postId = like.parentId;

            if (!likesGroupedByPostId[postId]) {

                likesGroupedByPostId[postId] = [];
            }

            if (likesGroupedByPostId[postId].length < 3 && like.status === LikeStatus.Like) {

                likesGroupedByPostId[postId].push(like);

                if (!idsOfRecentUsersWhoHaveLiked.includes(like.userId)) {

                    idsOfRecentUsersWhoHaveLiked.push(like.userId);
                }
            }

            if (userId && userId === like.userId) {

                usersReactionsForPosts[postId] = like.status;
            }
        }

        recentLikers = await this.usersRepository
            .findUsersByIds(idsOfRecentUsersWhoHaveLiked);

        return posts.map((post): PostViewModel => {

            const postId = String(post._id);

            const userReaction: LikeStatus = usersReactionsForPosts[postId]
                ? usersReactionsForPosts[postId]
                : LikeStatus.None;

            let recentLikersThisPost: UserDocument[] = [];

            if (likesGroupedByPostId[postId]) {

                recentLikersThisPost = likesGroupedByPostId[postId].map((like) => {

                    return recentLikers.find(user => String(user._id) === like.userId)!;
                });
            }

            return this._mapDbPostToViewModel(
                post,
                userReaction,
                recentLikersThisPost,
                likesGroupedByPostId[postId]
            );
        })
    }

    async findPost(
        postId: string,
        userId: string | null
    ): Promise<PostViewModel | null> {

        const post: PostDocument | null = await PostModel
            .findById(postId)
            .exec();

        if (!post) return null;

        let like: LikeDocument | null = null;

        if (userId) {

            like = await this.likesRepository
                .findLikeByUserIdAndParentId(userId, postId);
        }

        const userReaction: LikeStatus = like ? like.status : LikeStatus.None;

        const newestLikes: LikeDocument[] = await this.likesRepository
            .findNewestLikes(postId);

        const usersIds: string[] = newestLikes.map(l => l.userId);

        const users: UserDocument[] = await this.usersRepository
            .findUsersByIds(usersIds);

        const usersMap = new Map(users.map(user => [String(user._id), user]));

        const sortedUsers: UserDocument[] = usersIds.map(id => usersMap.get(id)).filter(Boolean) as UserDocument[];

        return this._mapDbPostToViewModel(post, userReaction, sortedUsers, newestLikes);
    }

    async getPostsCount(blogId?: string): Promise<number> {

        let filter: any = {};

        blogId
            ? filter = {blogId}
            : {};

        return PostModel
            .countDocuments(filter)
            .lean();
    }

    _mapDbPostToViewModel(
        post: WithId<Post>,
        userReaction: LikeStatus,
        recentLikersThisPost: UserDocument[],
        recentLikes: LikeDocument[]
    ): PostViewModel {

        if (!recentLikes || recentLikes.length < 1) {

            return {
                id: String(post._id),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                extendedLikesInfo: {
                    likesCount: post.reactions.likeCount,
                    dislikesCount: post.reactions.dislikeCount,
                    myStatus: userReaction,
                    newestLikes: []
                },
                createdAt: post.createdAt
            };
        }

        const newestLikes = [];

        for (let i = 0; i < recentLikes.length; i++) {

            const likeInfo = {
                addedAt: recentLikes[i].createdAt.toISOString(),
                userId: String(recentLikersThisPost[i]._id),
                login: recentLikersThisPost[i].login
            }

            newestLikes.push(likeInfo);
        }

        return {
            id: String(post._id),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            extendedLikesInfo: {
                likesCount: post.reactions.likeCount,
                dislikesCount: post.reactions.dislikeCount,
                myStatus: userReaction,
                newestLikes
            },
            createdAt: post.createdAt
        };
    }

    _mapPostsViewModelToPaginationResponse(
        posts: PostViewModel[],
        blogsCount: number,
        sortQueryDto: SortQueryDto
    ): Paginator<PostViewModel> {

        return {
            pagesCount: Math.ceil(blogsCount / sortQueryDto.pageSize),
            page: sortQueryDto.pageNumber,
            pageSize: sortQueryDto.pageSize,
            totalCount: blogsCount,
            items: posts
        };
    }
}

export {PostsQueryRepository};