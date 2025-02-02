enum SortDirection {
    Ascending = 'asc',
    Descending = 'desc'
}

enum MatchMode {
    Exact = 'exact',
    Partial = 'partial',
}

type FilterCondition =
    { login?: string | { $regex: string; $options: string } }
    | { email?: string | { $regex: string; $options: string } }
    |{ name?: string | { $regex: string; $options: string } }
    |{ blogId?: string | { $regex: string; $options: string } };

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
    sortDirection: SortDirection,
    searchNameTerm: string | null,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
};

type Paginator<T> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[];
};


export {
    SortDirection,
    MatchMode,
    FilterCondition,
    SortingAndPaginationParamsType,
    PaginationAndSortFilterType,
    Paginator,
};