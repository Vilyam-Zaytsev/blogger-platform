import {Paginator} from "../../common/types/input-output-types/pagination-sort-types";
import {injectable} from "inversify";
import {SortOptionsType} from "../../common/types/sort-options-type";
import {SortQueryDto} from "../../common/helpers/sort-query-dto";
import {LikeDetailsViewModel, PostDocument, PostModel, PostViewModel} from "../domain/post-entity";
import {GroupedLikesByPostId, LikeDocument, LikeStatus} from "../../07-likes/like-entity";
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
        ): Promise<Paginator<PostViewModel>> {

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

        const postsIds: string[] = posts.map(post => String(post._id));

        const groupsOfRecentLikes: GroupedLikesByPostId[] = await this.likesRepository
            .findRecentLikesForAllPosts(postsIds);

        //1. достать id всех лайкеров и сложить в массив usersIds
        // (для того чтобы запросить из бд лайкеров и взять у них логины)
        const setUsersIds: Set<string> = groupsOfRecentLikes.reduce<Set<string>>(
            (
                acc: Set<string>,
                groupRecentLikes: GroupedLikesByPostId
            ): Set<string> => {

                groupRecentLikes.recentLikes.forEach(like => {

                        acc.add(like.userId);
                })

                return acc;
            },
            new Set<string>()
        );

        const users: UserDocument[] = await this.usersRepository
            .findUsersByIds([...setUsersIds]);

        //2. определить myStatus пользователя который делает запрос за постоми.
        const mapUserReactionsForPosts: Map<string, LikeStatus> = new Map();

        if (userId) {

            const allReactionsForPostsThisUser: LikeDocument[] = await this.likesRepository
                .findLikesByUserIdAndParentsIds(userId, postsIds);

            allReactionsForPostsThisUser.reduce<Map<string, LikeStatus>>(
                (
                    acc: Map<string, LikeStatus>,
                    like: LikeDocument
                ): Map<string, LikeStatus> => {

                    acc.set(like.parentId, like.status);

                    return acc;
                },
                mapUserReactionsForPosts
            );
        }

        //3. сформировать объект LikeDetails
        const mapLikeDetails: Map<string, LikeDetailsViewModel[]> = new Map();

        groupsOfRecentLikes.reduce<Map<string, LikeDetailsViewModel[]>>(
            (
                acc: Map<string, LikeDetailsViewModel[]>,
                groupRecentLikes: GroupedLikesByPostId
            ): Map<string, LikeDetailsViewModel[]> => {

                const likesDetails: LikeDetailsViewModel[] = [];

                groupRecentLikes.recentLikes.forEach(like => {

                    const user: UserDocument | undefined = users.find(user => String(user._id) === like.userId);

                    const likeDetails: LikeDetailsViewModel = {
                        addedAt: like.createdAt.toISOString(),
                        userId: like.userId,
                        login: user ? user.login : 'unknown'
                    }

                    likesDetails.push(likeDetails);
                });

                const postId: string = String(groupRecentLikes.postId);

                acc.set(postId, likesDetails)

                return acc;
            },
            mapLikeDetails
        );

        //преобразовать все посты во PostViewModel
        const postsViewModel: PostViewModel[] = posts.map((post) => {

            const postId: string = String(post._id);

            const userReaction: LikeStatus | undefined = mapUserReactionsForPosts.get(postId);

            const likeDetails: LikeDetailsViewModel[] | undefined = mapLikeDetails.get(postId);

            return this._mapDbPostToViewModel(
                post,
                userReaction ? userReaction : LikeStatus.None,
                likeDetails ? likeDetails : null
            );
        });

        //преобразовать все посты во PaginationResponse
        const postsCount: number = await this.getPostsCount(blogId);

        return this._mapPostsViewModelToPaginationResponse(
                postsViewModel,
                postsCount,
                sortQueryDto
            );
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
            .findRecentLikesForOnePost(postId);

        const usersIds: string[] = newestLikes.map(l => l.userId);

        const users: UserDocument[] = await this.usersRepository
            .findUsersByIds(usersIds);

        //3. сформировать объект LikeDetails
        const likesDetails: LikeDetailsViewModel[] = newestLikes.map((like) => {

            const user: UserDocument | undefined = users.find(user => String(user._id) === like.userId);

            const likeDetails: LikeDetailsViewModel = {
                addedAt: like.createdAt.toISOString(),
                userId: like.userId,
                login: user ? user.login : 'unknown'
            }

            return likeDetails;
        })

        return this._mapDbPostToViewModel(post, userReaction, likesDetails);
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
        post: PostDocument,
        userReaction: LikeStatus,
        likesDetails: LikeDetailsViewModel[] | null
    ): PostViewModel {

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
                    newestLikes: likesDetails ?? []
                },
                createdAt: post.createdAt
            };
    }

    _mapPostsViewModelToPaginationResponse(
        posts: PostViewModel[],
        postsCount: number,
        sortQueryDto: SortQueryDto
    ): Paginator<PostViewModel> {

        return {
            pagesCount: Math.ceil(postsCount / sortQueryDto.pageSize),
            page: sortQueryDto.pageNumber,
            pageSize: sortQueryDto.pageSize,
            totalCount: postsCount,
            items: posts
        };
    }
}

export {PostsQueryRepository};