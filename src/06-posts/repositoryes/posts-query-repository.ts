import {PostDbType} from "../types/post-db-type";
import {postsCollection} from "../../db/mongoDb";
import {ObjectId, Sort, WithId} from "mongodb";
import {
    MatchMode,
    PaginationAndSortFilterType,
    Paginator
} from "../../common/types/input-output-types/pagination-sort-types";
import {createPostsSearchFilter} from "../helpers/create-posts-search-filter";
import {PostViewModel} from "../types/input-output-types";
import {BlogViewModel} from "../../05-blogs/types/input-output-types";


const postsQueryRepository = {

    async findPosts(sortQueryDto: PaginationAndSortFilterType, blogId?: string): Promise<PostViewModel[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        } = sortQueryDto;

        const filter: any = createPostsSearchFilter(
            {blogId},
            MatchMode.Exact
        );

        const posts: WithId<PostDbType>[] = await postsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return posts.map(p => this._mapDbPostToViewModel(p));
    },

    async getPostsCount(blogId?: string ): Promise<number> {

        const filter: any = createPostsSearchFilter(
            {blogId},
            MatchMode.Exact
        );

        return await postsCollection
            .countDocuments(filter);
    },

    async findPost(id: string): Promise<PostViewModel | null> {
            const post: WithId<PostDbType> | null = await postsCollection
                .findOne({_id: new ObjectId(id)});

            if (!post) return null;

            return this._mapDbPostToViewModel(post);
    },

    _mapDbPostToViewModel(post: WithId<PostDbType>): PostViewModel {
        return {
            id: String(post._id),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt
        };
    },

    _mapPostsViewModelToPaginationResponse(
        posts: PostViewModel[],
        blogsCount: number,
        paginationAndSortFilter: PaginationAndSortFilterType
    ): Paginator<PostViewModel> {

        return {
            pagesCount: Math.ceil(blogsCount / paginationAndSortFilter.pageSize),
            page: paginationAndSortFilter.pageNumber,
            pageSize: paginationAndSortFilter.pageSize,
            totalCount: blogsCount,
            items: posts
        };
    }
};

export {postsQueryRepository};