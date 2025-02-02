import {PaginationAndSortFilterType, SortDirection} from "../../../types/input-output-types/pagination-sort-types";
import {createPaginationAndSortFilter} from "../../create-pagination-and-sort-filter";
import {console_log_e2e, console_log_unit} from "../../../../../__tests__/helpers/test-helpers";

describe('CREATE PAGINATION AND SORT FILTER', () => {

    it('should create a filter with default values if the user has not passed the values for pagination and sorting.', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({});

            expect(resultCreateFilter).toEqual({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: SortDirection.Descending,
                searchNameTerm: null,
                searchLoginTerm: null,
                searchEmailTerm: null,
            });

            console_log_unit(resultCreateFilter, 'Test 1: Create pagination and sort filter');
    });

    it('should create a filter with user values for pagination and sorting.', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                pageNumber: '5',
                pageSize: '20',
                sortBy: 'login',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 5,
                pageSize: 20,
                sortBy: 'login',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            console_log_unit(resultCreateFilter, 'Test 2: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default №1).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                pageNumber: '5',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 5,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: SortDirection.Descending,
                searchNameTerm: null,
                searchLoginTerm: null,
                searchEmailTerm: null,
            });

            console_log_unit(resultCreateFilter, 'Test 3: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №2).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                pageNumber: '5',
                pageSize: '20',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 5,
                pageSize: 20,
                sortBy: 'createdAt',
                sortDirection: SortDirection.Descending,
                searchNameTerm: null,
                searchLoginTerm: null,
                searchEmailTerm: null,
            });

            console_log_unit(resultCreateFilter, 'Test 4: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №3).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                pageNumber: '5',
                pageSize: '20',
                sortBy: 'name',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 5,
                pageSize: 20,
                sortBy: 'name',
                sortDirection: SortDirection.Descending,
                searchNameTerm: null,
                searchLoginTerm: null,
                searchEmailTerm: null,
            });

            console_log_unit(resultCreateFilter, 'Test 5: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №4).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                pageNumber: '5',
                pageSize: '20',
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 5,
                pageSize: 20,
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: null,
                searchLoginTerm: null,
                searchEmailTerm: null,
            });

            console_log_unit(resultCreateFilter, 'Test 6: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №5).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                pageNumber: '5',
                pageSize: '20',
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 5,
                pageSize: 20,
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: null,
                searchEmailTerm: null,
            });

            console_log_unit(resultCreateFilter, 'Test 7: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №6).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                pageNumber: '5',
                pageSize: '20',
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 5,
                pageSize: 20,
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: null,
            });

            console_log_unit(resultCreateFilter, 'Test 8: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №7).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                pageNumber: '5',
                pageSize: '20',
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 5,
                pageSize: 20,
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            console_log_unit(resultCreateFilter, 'Test 9: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №8).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                pageSize: '20',
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 1,
                pageSize: 20,
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            console_log_unit(resultCreateFilter, 'Test 10: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №9).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'name',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            console_log_unit(resultCreateFilter, 'Test 11: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №10).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: SortDirection.Ascending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            console_log_unit(resultCreateFilter, 'Test 12: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №11).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: SortDirection.Descending,
                searchNameTerm: 'aa',
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            console_log_unit(resultCreateFilter, 'Test 13: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №12).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: SortDirection.Descending,
                searchNameTerm: null,
                searchLoginTerm: 'bb',
                searchEmailTerm: 'cc',
            });

            console_log_unit(resultCreateFilter, 'Test 14: Create pagination and sort filter');
    });

    it('should create a filter for pagination and sorting (some values are user-defined, and some are default' +
        ' №13).', () => {

            const resultCreateFilter: PaginationAndSortFilterType = createPaginationAndSortFilter({
                searchEmailTerm: 'cc',
            });

            expect(resultCreateFilter).toEqual({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: SortDirection.Descending,
                searchNameTerm: null,
                searchLoginTerm: null,
                searchEmailTerm: 'cc',
            });

            console_log_unit(resultCreateFilter, 'Test 15: Create pagination and sort filter');
    });
});