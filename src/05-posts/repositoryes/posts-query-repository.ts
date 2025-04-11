import {WithId} from "mongodb";
import {Paginator} from "../../common/types/input-output-types/pagination-sort-types";
import {injectable} from "inversify";
import {SortOptionsType} from "../../common/types/sort-options-type";
import {SortQueryDto} from "../../common/helpers/sort-query-dto";
import {Post, PostModel, PostViewModel} from "../domain/post-entity";
import {LikeStatus} from "../../07-likes/like-entity";

@injectable()
class PostsQueryRepository {

    async findPosts(sortQueryDto: SortQueryDto, blogId?: string): Promise<PostViewModel[]> {

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

        const posts: WithId<Post>[] = await PostModel
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as SortOptionsType)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        return posts.map(p => this._mapDbPostToViewModel(p));
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

    async findPost(id: string): Promise<PostViewModel | null> {

        const post: WithId<Post> | null = await PostModel
            .findById(id)
            .exec();

        if (!post) return null;

        return this._mapDbPostToViewModel(post);
    }

    _mapDbPostToViewModel(post: WithId<Post>): PostViewModel {
        return {
            id: String(post._id),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.None,
                newestLikes: [
                    {
                        addedAt: 'aaa',
                        userId: '111',
                        login: 'aaa'
                    }
                ]
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