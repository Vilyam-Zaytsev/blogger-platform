import {PostDbType} from "../types/db-types/post-db-type";
import {PostViewModel} from "../types/input-output-types/posts-types";
import {ObjectId, WithId} from "mongodb";
import {PaginationResponse} from "../types/input-output-types/pagination-types";
import {qPostsRepository} from "../repositoryes/qPosts-repository";
import {sortQueryFilterType} from "../types/input-output-types/sort-query-filter-types";

const qPostsService = {
    async findPosts(sortQueryDto: sortQueryFilterType): Promise<PaginationResponse<PostDbType>>{

        const {
            pageNumber,
            pageSize,
            blogId
        } = sortQueryDto;

        const posts: WithId<PostDbType>[] = await qPostsRepository
            .findPosts(sortQueryDto);

        const postsCount: number = await qPostsRepository
            .getPostsCount(blogId);

        return {
            pageCount: Math.ceil(postsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postsCount,
            items: posts.map(p => this.mapToViewModel(p))
        };
    },
    async findPost(id: string | ObjectId): Promise<PostViewModel | null> {

        const foundPost: WithId<PostDbType> | null = await qPostsRepository
            .findPost(id);

        if (!foundPost) return null;

        return this.mapToViewModel(foundPost);
    },
    mapToViewModel(post: WithId<PostDbType>): PostViewModel {
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

export {qPostsService};