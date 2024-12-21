import {Request, Response} from "express";
import {BlogInputModel, BlogViewModel, URIParamsBlogIdModel} from "../types/input-output-types/blogs-types";
import {blogsRepository} from "../repositoryes/blogs-repository";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";
import {SETTINGS} from "../settings";

const blogsController = {
    getBlogs: async (
        req: Request,
        res: Response<BlogViewModel[]>) => {
        try {
            const blogs: BlogViewModel[] = await blogsRepository.findBlogs();

            res
                .status(SETTINGS.HTTP_STATUSES.OK_200)
                .json(blogs);

            return;
        } catch (error) {
            console.error(error);
        }
    },
    getBlog: async (
        req: RequestWithParams<URIParamsBlogIdModel>,
        res: Response) => {
        try {
            const foundBlog: BlogViewModel | null = await blogsRepository.findBlog(req.params.id);

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
        try {
            const dataCreatingBlog = {
                name: req.body.name,
                description: req.body.description,
                websiteUrl: req.body.websiteUrl
            };
            const createdBlog: BlogViewModel = await blogsRepository.createBlog(dataCreatingBlog);

            res
                .status(SETTINGS.HTTP_STATUSES.CREATED_201)
                .json(createdBlog);
        } catch (error) {
            console.error(error);
        }
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
            const updatedBlog: boolean = await blogsRepository.updateBlog(req.params.id, dataUpdatingBlog);

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
            const isDeletedBlog: boolean = await blogsRepository.deleteBlog(req.params.id);

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