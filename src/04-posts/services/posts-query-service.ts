import {PostDbType} from "../types/post-db-type";
import {PostViewModel} from "../types/input-output-types";
import {ObjectId, WithId} from "mongodb";
import {PaginationAndSortFilterType, PaginationResponse} from "../../common/types/input-output-types/pagination-sort-types";
import {postsQueryRepository} from "../repositoryes/posts-query-repository";
import {blogsQueryService} from "../../03-blogs/services/blogs-query-service";
import {BlogViewModel} from "../../03-blogs/types/input-output-types";

const postsQueryService = {
    async findPosts(sortQueryDto: PaginationAndSortFilterType, blogId?:string): Promise<PaginationResponse<PostViewModel> | null> {

        const {
            pageNumber,
            pageSize,
        } = sortQueryDto;

        if (blogId) {
            if (!ObjectId.isValid(blogId)) return null;

            const isExistBlog: BlogViewModel | null = await blogsQueryService
            .findBlog(blogId);

            if (!isExistBlog) return null;
        }

        const posts: WithId<PostDbType>[] = await postsQueryRepository
            .findPosts(sortQueryDto, blogId);

        const postsCount: number = await postsQueryRepository
            .getPostsCount(blogId);

        return {
            pagesCount: Math.ceil(postsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postsCount,
            items: posts.map(p => this.mapToViewModel(p))
        };
    },
    async findPost(id: string): Promise<PostViewModel | null> {

        const foundPost: WithId<PostDbType> | null = await postsQueryRepository
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

export {postsQueryService};