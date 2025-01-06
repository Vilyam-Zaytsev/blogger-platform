type SortingAndPaginationParamsType = {
    pageNumber?: string,
    pageSize?: string,
    sortBy?: string,
    sortDirection?: string,
    searchNameTerm?: string,
    searchLoginTerm?: string,
    searchEmailTerm?: string,
};

type PaginationAndSortFilterType = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
    searchNameTerm: string | null,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
};

type PaginationResponse<T> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[];
};

export {
    SortingAndPaginationParamsType,
    PaginationAndSortFilterType,
    PaginationResponse
};