enum SortDirection {
    Ascending = 'asc',
    Descending = 'desc'
}

type SortingAndPaginationParamsType = {
    pageNumber?: string,
    pageSize?: string,
    sortBy?: string,
    sortDirection?: string,
    searchNameTerm?: string,
    searchLoginTerm?: string,
    searchEmailTerm?: string,
};

class SortQueryDto {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: SortDirection;
    searchNameTerm: string | null;
    searchLoginTerm: string | null;
    searchEmailTerm: string | null;

    constructor(queryParams: SortingAndPaginationParamsType) {

        this.pageNumber = queryParams.pageNumber
            ? Number(queryParams.pageNumber)
            : 1;
        this.pageSize = queryParams.pageSize
            ? Number(queryParams.pageSize)
            : 10;
        this.sortBy = queryParams.sortBy
            ? String(queryParams.sortBy)
            : 'createdAt';
        this.sortDirection = queryParams.sortDirection === 'asc'
            ? SortDirection.Ascending
            : SortDirection.Descending;
        this.searchNameTerm = queryParams.searchNameTerm || null;
        this.searchLoginTerm = queryParams.searchLoginTerm || null;
        this.searchEmailTerm = queryParams.searchEmailTerm || null;
    }
}

export {
    SortQueryDto,
    SortDirection,
    SortingAndPaginationParamsType
};
