import {Response} from "express";
import {RequestWithQuery} from "../types/input-output-types/request-types";
import {SortFilterType} from "../types/input-output-types/sort-filter-types";
import {PaginationResponse} from "../types/input-output-types/pagination-types";
import {UserViewModel} from "../types/input-output-types/user-types";

const usersController = {
    getUsers: async (
        req: RequestWithQuery<SortFilterType>,
        res: Response<PaginationResponse<UserViewModel>>
    ) => {
        
    }
};

export {usersController};