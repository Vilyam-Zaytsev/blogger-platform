import {Response} from "express";
import {BlogInputModel, BlogPostInputModel, BlogViewModel} from "./types/input-output-types";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../common/types/input-output-types/request-types";
import {SETTINGS} from "../common/settings";
import {BlogsService} from "./domain/blogs-service";
import {BlogDbType} from "./types/blog-db-type";
import {Paginator,} from "../common/types/input-output-types/pagination-sort-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {BlogsQueryRepository} from "./repositoryes/blogs-query-repository";
import {PostViewModel} from "../06-posts/types/input-output-types";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatus} from "../common/types/result-types/result-status";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {PostsQueryRepository} from "../06-posts/repositoryes/posts-query-repository";
import {injectable} from "inversify";
import {SortingAndPaginationParamsType, SortQueryDto} from "../common/helpers/sort-query-dto";

@injectable()
class BlogsController {

    constructor(
        private blogsService: BlogsService,
        private blogsQueryRepository: BlogsQueryRepository,
        private postsQueryRepository: PostsQueryRepository
    ) {};

    async getBlogs(
        req: RequestWithQuery<SortingAndPaginationParamsType>,
        res: Response<Paginator<BlogDbType>>
    ){

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchNameTerm: req.query.searchNameTerm
        };

        const paginationAndSortFilter: SortQueryDto = new SortQueryDto(sortingAndPaginationParams);

        const foundBlogs: BlogViewModel[] = await this.blogsQueryRepository
            .findBlogs(paginationAndSortFilter);

        const blogsCount: number = await this.blogsQueryRepository
            .getBlogsCount(paginationAndSortFilter.searchNameTerm);

        const paginationResponse: Paginator<BlogViewModel> = await this.blogsQueryRepository
            ._mapBlogsViewModelToPaginationResponse(
                foundBlogs,
                blogsCount,
                paginationAndSortFilter
            );

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(paginationResponse);
    }

    async getBlog(
        req: RequestWithParams<IdType>,
        res: Response<BlogViewModel>
    ){

        const foundBlog: BlogViewModel | null = await this.blogsQueryRepository
            .findBlog(req.params.id);

        if (!foundBlog) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundBlog);
    }

    async createBlog(
        req: RequestWithBody<BlogInputModel>,
        res: Response<BlogViewModel>
    ){

        const dataForCreatingBlog: BlogInputModel = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };

        const idCreatedBlog: string = await this.blogsService
            .createBlog(dataForCreatingBlog);

        const createdBlog: BlogViewModel | null = await this.blogsQueryRepository
            .findBlog(idCreatedBlog);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdBlog!);
    }

    async updateBlog(
        req: RequestWithParamsAndBody<IdType, BlogInputModel>,
        res: Response<BlogViewModel>
    ){

        const dataForBlogUpdates: BlogInputModel = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };

        const updatedBlog: boolean = await this.blogsService
            .updateBlog(req.params.id, dataForBlogUpdates);

        if (!updatedBlog) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }

    async deleteBlog(
        req: RequestWithParams<IdType>,
        res: Response
    ){

        const isDeletedBlog: boolean = await this.blogsService
            .deleteBlog(req.params.id);

        if (!isDeletedBlog) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }

    async getPosts(
        req: RequestWithParamsAndQuery<IdType, SortingAndPaginationParamsType>,
        res: Response<Paginator<PostViewModel>>
    ){

        const blogId: string = req.params.id;

        const resultCheckBlogId: ResultType<string | null> = await this.blogsService
            .checkBlogId(blogId);

        if (resultCheckBlogId.status !== ResultStatus.Success) {

            res
                .sendStatus(mapResultStatusToHttpStatus(resultCheckBlogId.status));

            return;
        }

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
        };

        const paginationAndSortFilter: SortQueryDto = new SortQueryDto(sortingAndPaginationParams);

        const foundPosts: PostViewModel[] = await this.postsQueryRepository
            .findPosts(paginationAndSortFilter, blogId);

        const postsCount: number = await this.postsQueryRepository
            .getPostsCount(blogId);

        const paginationResponse: Paginator<PostViewModel> = await this.postsQueryRepository
            ._mapPostsViewModelToPaginationResponse(
                foundPosts,
                postsCount,
                paginationAndSortFilter
            );

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(paginationResponse);
    }

    async createPost(
        req: RequestWithParamsAndBody<IdType, BlogPostInputModel>,
        res: Response<PostViewModel>
    ){

        const blogId: string = req.params.id;

        const dataForCreatingPost: BlogPostInputModel = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
        };

        const resultCreatedPost: ResultType<string | null> = await this.blogsService
            .createPost(blogId, dataForCreatingPost);

        if (resultCreatedPost.status !== ResultStatus.Success) {

            res
                .sendStatus(mapResultStatusToHttpStatus(resultCreatedPost.status));

            return;
        }

        const createdPost: PostViewModel | null = await this.postsQueryRepository
            .findPost(resultCreatedPost.data!);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdPost!)
    }
}

export {BlogsController};