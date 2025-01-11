import {Response} from "express";
import {
    BlogInputModel,
    BlogViewModel,
    URIParamsBlogId
} from "./types/input-output-types";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody, RequestWithQuery
} from "../common/types/input-output-types/request-types";
import {SETTINGS} from "../common/settings";
import {blogsService} from "./services/blogs-service";
import {BlogDbType} from "./types/blog-db-type";
import {configPaginationAndSortParams} from "../common/helpers/config-pagination-and-sort-params";
import {PaginationResponse, SortingAndPaginationParamsType} from "../common/types/input-output-types/pagination-sort-types";
import {qBlogsService} from "./services/qBlogs-service";


const blogsController = {
    getBlogs: async (
        req: RequestWithQuery<SortingAndPaginationParamsType>,
        res: Response<PaginationResponse<BlogDbType>>
    ) => {

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchNameTerm: req.query.searchNameTerm
        }

        const foundBlogs: PaginationResponse<BlogViewModel> = await qBlogsService
            .findBlogs(configPaginationAndSortParams(sortingAndPaginationParams));

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundBlogs);
    },
    getBlog: async (
        req: RequestWithParams<URIParamsBlogId>,
        res: Response<BlogViewModel>
    ) => {

        const foundBlog: BlogViewModel | null = await qBlogsService
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
    createAndInsertBlog: async (
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

        const createdBlog: BlogViewModel | null = await qBlogsService
            .findBlog(idCreatedBlog);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdBlog!);
    },
    updateBlog: async (
        req: RequestWithParamsAndBody<URIParamsBlogId, BlogInputModel>,
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
        req: RequestWithParams<URIParamsBlogId>,
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