import {Response, Request} from "express";
import {RequestWithBody, RequestWithQuery} from "../types/input-output-types/request-types";
import {PaginationResponse, SortingAndPaginationParamsType} from "../types/input-output-types/pagination-sort-types";
import {URIParamsUserId, UserInputModel, UserViewModel} from "../types/input-output-types/user-types";
import {userService} from "../services/user-service";
import {qUserService} from "../services/qUserServise";
import {SETTINGS} from "../settings";
import {configPaginationAndSortParams} from "../helpers/config-pagination-and-sort-params";

const usersController = {
    getUsers: async (
        req: RequestWithQuery<SortingAndPaginationParamsType>,
        res: Response<PaginationResponse<UserViewModel>>
    ) => {
        const filter: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchLoginTerm: req.query.searchLoginTerm,
            searchEmailTerm: req.query.searchEmailTerm,
        };

        const foundUsers: PaginationResponse<UserViewModel> = await qUserService
            .findUsers(configPaginationAndSortParams(filter));

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