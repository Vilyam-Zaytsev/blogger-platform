enum SortDirection {
    Ascending = 'asc',
    Descending = 'desc'
}

enum MatchMode {
    Exact = 'exact',
    Partial = 'partial',
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
type UsersSearchFilterType = {
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
};

type FilterCondition =
    { login?: string | { $regex: string; $options: string } }
    | { email?: string | { $regex: string; $options: string } }
    |{ name?: string | { $regex: string; $options: string } };

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
    MatchMode,
    SearchFieldName,
    SearchFilterType,
    UsersSearchFilterType,
    FilterCondition,
    SortingAndPaginationParamsType,
    PaginationAndSortFilterType,
    PaginationResponse,
};