import {PostDbType} from "../types/post-db-type";
import {PostViewModel} from "../types/input-output-types";
import {ObjectId, WithId} from "mongodb";
import {PaginationAndSortFilterType, PaginationResponse} from "../../common/types/input-output-types/pagination-sort-types";
import {qPostsRepository} from "../repositoryes/posts-query-repository";
import {qBlogsService} from "../../03-blogs/services/blogs-query-service";
import {BlogViewModel} from "../../03-blogs/types/input-output-types";

const qPostsService = {
    async findPosts(sortQueryDto: PaginationAndSortFilterType, blogId?:string): Promise<PaginationResponse<PostViewModel> | null> {

        const {
            pageNumber,
            pageSize,
        } = sortQueryDto;

        if (blogId) {
            if (!ObjectId.isValid(blogId)) return null;

            const isExistBlog: BlogViewModel | null = await qBlogsService
            .findBlog(blogId);

            if (!isExistBlog) return null;
        }

        const posts: WithId<PostDbType>[] = await qPostsRepository
            .findPosts(sortQueryDto, blogId);

        const postsCount: number = await qPostsRepository
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