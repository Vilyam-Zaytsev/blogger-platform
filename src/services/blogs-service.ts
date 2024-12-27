import {blogsRepository} from "../repositoryes/blogs-repository";
import {BlogInputModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {InsertOneResult, WithId} from "mongodb";
import {PaginationResponse} from "../types/input-output-types/pagination-types";


const blogsService = {
    async findBlogs(
        searchNameTerm,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    ): Promise<PaginationResponse<BlogDbType>> {
        const blogs: WithId<BlogDbType>[] = await blogsRepository
            .findBlogs(
                searchNameTerm,
                sortBy,
                sortDirection,
                pageNumber,
                pageSize
            );

        const blogCount: number = await blogsRepository
            .getBlogsCount(searchNameTerm);

        return {
            pageCount: Math.ceil(blogCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: blogCount,
            items: blogs,
        };
    },
    async createBlog(blogData: BlogInputModel): Promise<InsertOneResult> {
        const newBlog: BlogDbType = {
            ...blogData,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };

        return await blogsRepository
            .createBlog(newBlog);
    },
    async updateBlog(id: string, data: BlogInputModel): Promise<boolean> {
        return await blogsRepository
            .updateBlog(id, data);
    },
    async deleteBlog(id: string): Promise<boolean> {
        return await blogsRepository
            .deleteBlog(id);
    },

};

export {blogsService};