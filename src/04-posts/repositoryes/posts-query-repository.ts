import {PostDbType} from "../types/post-db-type";
import {postsCollection} from "../../db/mongoDb";
import {ObjectId, Sort, WithId} from "mongodb";
import {MatchMode, PaginationAndSortFilterType} from "../../common/types/input-output-types/pagination-sort-types";
import {createPostsSearchFilter} from "../helpers/create-posts-search-filter";
import {PostViewModel} from "../types/input-output-types";


const postsQueryRepository = {
    async findPosts(sortQueryDto: PaginationAndSortFilterType, blogId?: string): Promise<WithId<PostDbType>[]> {

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

        return await postsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
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
};

export {postsQueryRepository};