import {WithId} from "mongodb";
import {Paginator} from "../../common/types/input-output-types/pagination-sort-types";
import {injectable} from "inversify";
import {SortOptionsType} from "../../common/types/sort-options-type";
import {SortQueryDto} from "../../common/helpers/sort-query-dto";
import {Post, PostDocument, PostModel, PostViewModel} from "../domain/post-entity";
import {GroupedLikesByPostId, LikeDocument, LikeStatus, MapLikerInfo} from "../../07-likes/like-entity";
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
    ): Promise<number> {
        // ): Promise<PostViewModel[]> {

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

        const groupsOfRecentLikes: GroupedLikesByPostId[] = await this.likesRepository
            .findRecentLikesForAllPosts(postsIds);

        //1. достать id всех лайкеров и сложить в массив usersIds
        // (для того чтобы запросить из бд лайкеров и взять у них логины)

        const usersIds: string[] = groupsOfRecentLikes.reduce<string[]>(
            (
                acc: string[],
                groupRecentLikes: GroupedLikesByPostId
            ): string[] => {

                groupRecentLikes.recentLikes.forEach(like => {

                    if (!acc.includes(like.userId)) {

                        acc.push(like.userId);
                    }
                })

                return acc;
            },
            []
        );

        const users: UserDocument[] = await this.usersRepository
            .findUsersByIds(usersIds);

        //2. вычислить myStatus пользователя который делает запрос за постоми.


        // const informationAboutPostsForViewModel = posts.reduce(
        //     (
        //         acc,
        //         groupRecentLikes: GroupedLikesByPostId
        //     ) => {
        //
        //
        //     },
        //     []
        // )

        // вариант 1
        // const postsViewModel: any[] = posts.map((post) => {
        //
        //     const informationAboutPostsForViewModel: any = {
        //         likersInfo: {
        //             id: userId ? userId : null,
        //             login: userId ? users.find(user => String(user._id) === userId)?.login : null,
        //             status: userId ? groupsOfRecentLikes
        //                 .find((g) => g.postId === String(post._id))
        //                 ?.recentLikes
        //                 .find(l => l.userId === userId)
        //         }
        //     }
        // })

        // const informationAboutPostsForViewModel =


        // {depth: null}
        console.dir(groupsOfRecentLikes, {depth: null})
        console.dir(usersIds, {depth: null})


        // const mapUsersReactionsForPosts: Map<string, MapLikerInfo> = new Map();
        //
        // const mapGroupsOfLikersPosts: Map<string, string[]> = new Map();
        //
        // groupsOfRecentLikes.reduce<Map<string, MapLikerInfo>>(
        //     (
        //         acc: Map<string, MapLikerInfo>,
        //         groupRecentLikes: GroupedLikesByPostId
        //     ): Map<string, MapLikerInfo> => {
        //
        //
        //         groupRecentLikes.recentLikes.forEach((like) => {
        //
        //             if (!likersIds.includes(like.userId)) {
        //
        //                 likersIds.push(like.userId);
        //             }
        //         });
        //
        //         //2. определить LikeStatus пользователя
        //         let likerReaction: LikeStatus = LikeStatus.None;
        //         let likerId: string | null = null;
        //
        //         if (userId) {
        //
        //             likerId = userId;
        //
        //             const like: LikeDocument | undefined = groupRecentLikes.recentLikes.find(like => like.userId === userId);
        //
        //             likerReaction = like ? like.status : LikeStatus.None;
        //         }
        //
        //         acc.set(
        //             String(groupRecentLikes.postId),
        //             {
        //                 likerReaction,
        //                 likerId
        //             }
        //         );
//=========================
        // groupRecentLikes.recentLikes.forEach((like) => {
        //
        //     if (!likersIds.includes(like.userId)) {
        //
        //         likersIds.push(like.userId);
        //     }
        //
        //     if (mapGroupsOfLikersPosts.has(like.parentId)) {
        //
        //         if (!mapGroupsOfLikersPosts.get(like.parentId)?.includes(like.userId)) {
        //
        //             mapGroupsOfLikersPosts.get(like.parentId)?.push(like.userId);
        //         }
        //     } else {
        //
        //         mapGroupsOfLikersPosts.set(like.parentId, [like.userId]);
        //     }
        // });

        // return acc;
        // },
        // mapUsersReactionsForPosts
        // );

        // const allLikers: UserDocument[] = await this.usersRepository
        //     .findUsersByIds(likersIds);
        //
        // console.log(mapGroupsOfLikersPosts)
        //
        return 0;
        //
        // const postsViewModel: PostViewModel[] = posts.map((post): PostViewModel => {
        //
        //     const postId: string = String(post._id);
        //
        //     const userReaction: LikeStatus = mapUsersReactionsForPosts.get(postId)?.myStatus ?? LikeStatus.None;
        //
        //     const idsRecantLikers: string[] = mapGroupsOfLikersPosts.get(postId) ?? [];
        //
        //     return this._mapDbPostToViewModel(
        //         post,
        //         userReaction,
        //
        //     );
        // })
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