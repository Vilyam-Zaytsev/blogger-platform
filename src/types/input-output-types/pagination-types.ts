type PaginationResponse<T> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[];
};

export {PaginationResponse};