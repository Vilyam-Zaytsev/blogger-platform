import {
    PaginationAndSortFilterType,
    SortDirection,
    SortingAndPaginationParamsType
} from "../types/input-output-types/pagination-sort-types";

const configPaginationAndSortParams = (params: SortingAndPaginationParamsType): PaginationAndSortFilterType => {
    const pageNumber: number =
        params.pageNumber
            ? Number(params.pageNumber)
            : 1;
    const pageSize: number =
        params.pageSize
            ? Number(params.pageSize)
            : 10;
    const sortBy: string =
        params.sortBy
            ? params.sortBy === 'id'
                ? '_id'
                : params.sortBy
            : 'createdAt';
    const sortDirection: SortDirection =
        params.sortDirection === 'asc'
            ? SortDirection.Ascending
            : SortDirection.Descending;
    const searchNameTerm: string | null =
        params.searchNameTerm
            ? params.searchNameTerm
            : null;
    const searchLoginTerm: string | null =
        params.searchLoginTerm
            ? params.searchLoginTerm
            : null;
    const searchEmailTerm: string | null =
        params.searchEmailTerm
            ? params.searchEmailTerm
            : null;

    return {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchNameTerm,
        searchLoginTerm,
        searchEmailTerm
    };
};

export {configPaginationAndSortParams};
