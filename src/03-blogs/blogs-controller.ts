import {Response} from "express";
import {BlogInputModel, BlogPostInputModel, BlogViewModel} from "./types/input-output-types";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery
} from "../common/types/input-output-types/request-types";
import {SETTINGS} from "../common/settings";
import {blogsService} from "./services/blogs-service";
import {BlogDbType} from "./types/blog-db-type";
import {createPaginationAndSortFilter} from "../common/helpers/create-pagination-and-sort-filter";
import {
    PaginationAndSortFilterType,
    Paginator,
    SortingAndPaginationParamsType
} from "../common/types/input-output-types/pagination-sort-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {blogsQueryRepository} from "./repositoryes/blogs-query-repository";
import {PostViewModel} from "../04-posts/types/input-output-types";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatus} from "../common/types/result-types/result-status";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {postsQueryRepository} from "../04-posts/repositoryes/posts-query-repository";


const blogsController = {

    getBlogs: async (
        req: RequestWithQuery<SortingAndPaginationParamsType>,
        res: Response<Paginator<BlogDbType>>
    ) => {

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchNameTerm: req.query.searchNameTerm
        };

        const paginationAndSortFilter: PaginationAndSortFilterType =
            createPaginationAndSortFilter(sortingAndPaginationParams)

        const foundBlogs: BlogViewModel[] = await blogsQueryRepository
            .findBlogs(paginationAndSortFilter);

        const blogsCount: number = await blogsQueryRepository
            .getBlogsCount(paginationAndSortFilter.searchNameTerm);

        const paginationResponse: Paginator<BlogViewModel> = await blogsQueryRepository
            ._mapCommentsViewModelToPaginationResponse(
                foundBlogs,
                blogsCount,
                paginationAndSortFilter
            )

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(paginationResponse);
    },

    getBlog: async (
        req: RequestWithParams<IdType>,
        res: Response<BlogViewModel>
    ) => {

        const foundBlog: BlogViewModel | null = await blogsQueryRepository
            .findBlog(req.params.id);

        if (!foundBlog) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundBlog);
    },

    createBlog: async (
        req: RequestWithBody<BlogInputModel>,
        res: Response<BlogViewModel>
    ) => {

        const dataForCreatingBlog: BlogInputModel = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };

        const idCreatedBlog: string = await blogsService
            .createBlog(dataForCreatingBlog);

        const createdBlog: BlogViewModel | null = await blogsQueryRepository
            .findBlog(idCreatedBlog);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdBlog!);
    },

    createPost: async (
        req: RequestWithParamsAndBody<IdType, BlogPostInputModel>,
        res: Response<PostViewModel>
    ) => {

        const blogId: string = req.params.id;

        const dataForCreatingPost: BlogPostInputModel = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
        };

        const resultCreatedPost: ResultType<string | null> = await blogsService
            .createPost(blogId, dataForCreatingPost);

        if (resultCreatedPost.status !== ResultStatus.Success) {

            res
                .sendStatus(mapResultStatusToHttpStatus(resultCreatedPost.status));

            return;
        }

        const createdPost: PostViewModel | null = await postsQueryRepository
            .findPost(resultCreatedPost.data!);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdPost!)
    },

    updateBlog: async (
        req: RequestWithParamsAndBody<IdType, BlogInputModel>,
        res: Response<BlogViewModel>
    ) => {

        const dataForBlogUpdates: BlogInputModel = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };

        const updatedBlog: boolean = await blogsService
            .updateBlog(req.params.id, dataForBlogUpdates);

        if (!updatedBlog) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    },

    deleteBlog: async (
        req: RequestWithParams<IdType>,
        res: Response
    ) => {

        const isDeletedBlog: boolean = await blogsService
            .deleteBlog(req.params.id);

        if (!isDeletedBlog) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    },
};

export {blogsController};