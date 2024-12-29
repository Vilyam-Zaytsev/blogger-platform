import {Request} from "express";

const paginationParams = (req: Request) => {
    const pageNumber: number =
        req.query.pageNumber
        ? Number(req.query.pageNumber)
        : 1;
    const pageSize: number =
        req.query.pageSize
        ? Number(req.query.pageSize)
        : 10;
    const sortBy: string =
        req.query.sortBy
        ? String(req.query.sortBy)
        : 'createAt';
    const sortDirection: 'asc' | 'desc' =
        req.query.sortDirection && String(req.query.sortDirection) === 'asc'
            ? 'asc'
            : 'desc';
    const searchNameTerm: string | null =
        req.query.searchNameTerm
        ? String(req.query.searchNameTerm)
        : null;
    const blogId: string | null = req.query.blogId
        ? String(req.query.blogId)
        : null;

    return {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchNameTerm,
        blogId
    };
};

export {paginationParams};