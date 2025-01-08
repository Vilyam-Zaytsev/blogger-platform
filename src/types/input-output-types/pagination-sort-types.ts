enum SortDirection {
    Ascending = 'asc',
    Descending = 'desc'
}

enum SearchFieldName {
    blog = 'name',
    userLogin = 'login',
    userEmail = 'email'
}

type SearchFilterType = {
    blogId?: string | null,
    searchNameTerm?: string | null,
    searchLoginTerm?: string | null,
    searchEmailTerm?: string | null,
    nameOfSearchField?: SearchFieldName | null
};

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

type PaginationResponse<T> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[];
};



export {
    SortDirection,
    SearchFieldName,
    SearchFilterType,
    SortingAndPaginationParamsType,
    PaginationAndSortFilterType,
    PaginationResponse,
};