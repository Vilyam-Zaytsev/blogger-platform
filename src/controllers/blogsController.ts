import {Request, Response} from "express";
import {BlogInputModel, BlogViewModel, URIParamsBlogIdModel} from "../types/input-output-types/blogs-types";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";
import {SETTINGS} from "../settings";
import {blogsService} from "../services/blogs-service";
import {InsertOneResult, WithId} from "mongodb";
import {qBlogsRepository} from "../repositoryes/qBlogs-repository";
import {BlogDbType} from "../types/db-types/blog-db-type";

const blogsController = {
    getBlogs: async (
        req: Request,
        res: Response<BlogViewModel[]>) => {
        const blogs: WithId<BlogDbType>[] = await qBlogsRepository.findBlogs();
        const blogsViewModel: BlogViewModel[] = blogs.map(b => qBlogsRepository.mapToViewModel(b));

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(blogsViewModel);

        return;
    },
    getBlog: async (
        req: RequestWithParams<URIParamsBlogIdModel>,
        res: Response) => {
        try {
            const foundBlog: BlogViewModel | null = await blogsService.findBlog(req.params.id);

            if (!foundBlog) {
                res
                    .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                    .json({});

                return;
            }

            res
                .status(SETTINGS.HTTP_STATUSES.OK_200)
                .json(foundBlog);
        } catch (error) {
            console.error(error);
        }
    },
    createBlog: async (
        req: RequestWithBody<BlogInputModel>,
        res: Response<BlogViewModel>) => {
        const dataCreatingBlog = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };
        const blogId: InsertOneResult = await blogsService.createBlog(dataCreatingBlog);

        const createdBlog: BlogViewModel = await qBlogsRepository.findAndMapToViewModel(blogId);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdBlog);
    },
    updateBlog: async (
        req: RequestWithParamsAndBody<URIParamsBlogIdModel, BlogInputModel>,
        res: Response) => {
        try {
            const dataUpdatingBlog = {
                name: req.body.name,
                description: req.body.description,
                websiteUrl: req.body.websiteUrl
            };
            const updatedBlog: boolean = await blogsService.updateBlog(req.params.id, dataUpdatingBlog);

            if (!updatedBlog) {
                res
                    .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                    .json({});

                return;
            }

            res
                .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
                .json({});
        } catch (error) {
            console.error(error);
        }

    },
    deleteBlog: async (
        req: RequestWithParams<URIParamsBlogIdModel>,
        res: Response) => {
        try {
            const isDeletedBlog: boolean = await blogsService.deleteBlog(req.params.id);

            if (!isDeletedBlog) {
                res
                    .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                    .json({});

                return;
            }

            res
                .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
                .json({});
        } catch (error) {
            console.error(error);
        }
    },
};

export {blogsController};