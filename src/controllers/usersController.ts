import {Response, Request} from "express";
import {RequestWithBody, RequestWithQuery} from "../types/input-output-types/request-types";
import {PaginationAndSortFilterType} from "../types/input-output-types/sort-filter-types";
import {PaginationResponse} from "../types/input-output-types/pagination-types";
import {URIParamsUserId, UserInputModel, UserViewModel} from "../types/input-output-types/user-types";
import {userService} from "../services/user-service";
import {qUserService} from "../services/qUserServise";
import {SETTINGS} from "../settings";
import {paginationAndSortParams} from "../helpers/pagination-and-sort-params";

const usersController = {
    getUsers: async (
        req: RequestWithQuery<PaginationAndSortFilterType>,
        res: Response<PaginationResponse<UserViewModel>>
    ) => {
        const filter: PaginationAndSortFilterType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchLoginTerm: req.query.searchLoginTerm,
            searchEmailTerm: req.query.searchEmailTerm,
        };

        const foundUsers: PaginationResponse<UserViewModel> = await qUserService
            .findUsers(paginationAndSortParams(filter));

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundUsers);
    },
    createAndInsertUser: async (
        req: RequestWithBody<UserInputModel>,
        res: Response<UserViewModel>
    ) => {
        const dataForCreatingUser: UserInputModel = {
            login: req.body.login,
            email: req.body.email,
            password: req.body.password
        };

        const idCreatedUser: string | null = await userService
            .createUser(dataForCreatingUser);

        const createdUser: UserViewModel | null = await qUserService
            .findUser(idCreatedUser!);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdUser!);
    },
    deleteUser: async (
        req: Request<URIParamsUserId>,
        res: Response
    ) => {

    }
};

export {usersController};