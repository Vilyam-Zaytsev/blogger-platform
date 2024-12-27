type PaginationResponse<T> = {
    pageCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[];
};

export {PaginationResponse};