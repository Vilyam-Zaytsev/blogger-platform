import {Response, Request} from "express";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../common/types/input-output-types/request-types";
import {PaginationResponse, SortingAndPaginationParamsType} from "../common/types/input-output-types/pagination-sort-types";
import {URIParamsUserId, UserInputModel, UserViewModel} from "./types/input-output-types";
import {usersService} from "./services/users-service";
import {qUserService} from "./services/qUsers-servise";
import {SETTINGS} from "../settings";
import {configPaginationAndSortParams} from "../common/helpers/config-pagination-and-sort-params";
import {qUsersRepository} from "./repositoryes/qUsers-repository";

const usersController = {
    getUsers: async (
        req: RequestWithQuery<SortingAndPaginationParamsType>,
        res: Response<PaginationResponse<UserViewModel>>
    ) => {

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchLoginTerm: req.query.searchLoginTerm,
            searchEmailTerm: req.query.searchEmailTerm,
        };

        const foundUsers: PaginationResponse<UserViewModel> = await qUserService
            .findUsers(configPaginationAndSortParams(sortingAndPaginationParams));

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundUsers);
    },
    getUser: async (
        req: RequestWithParams<URIParamsUserId>,
        res: Response<UserViewModel>
    ) => {

        const foundUser: UserViewModel | null = await qUserService
            .findUser(req.params.id);

        if (!foundUser) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundUser);
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

        const idCreatedUser: string = await usersService
            .createUser(dataForCreatingUser);

        const createdUser: UserViewModel | null = await qUserService
            .findUser(idCreatedUser);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdUser!);
    },
    deleteUser: async (
        req: Request<URIParamsUserId>,
        res: Response
    ) => {

        const isDeletedUser: boolean = await usersService
            .deleteUser(req.params.id);

        if (!isDeletedUser) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }
};

export {usersController};