import {Response, Request} from "express";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../common/types/input-output-types/request-types";
import {PaginationResponse, SortingAndPaginationParamsType} from "../common/types/input-output-types/pagination-sort-types";
import {URIParamsUserId, UserInputModel, UserViewModel} from "./types/input-output-types";
import {usersService} from "./services/users-service";
import {qUserService} from "./services/qUsers-servise";
import {SETTINGS} from "../common/settings";
import {configPaginationAndSortParams} from "../common/helpers/config-pagination-and-sort-params";
import {qUsersRepository} from "./repositoryes/qUsers-repository";
import {ResultType} from "../common/types/result-types/result-type";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {mapResultExtensionsToErrorMessage} from "../common/helpers/map-result-extensions-to-error-message";
import {OutputErrorsType} from "../common/types/input-output-types/output-errors-type";

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
        res: Response<UserViewModel | OutputErrorsType>
    ) => {
        const dataForCreatingUser: UserInputModel = {
            login: req.body.login,
            email: req.body.email,
            password: req.body.password
        };

        const result: ResultType<string | null> = await usersService
            .createUser(dataForCreatingUser);

        if (!result.data) {
            res
                .status(mapResultStatusToHttpStatus(result.status))
                .json(mapResultExtensionsToErrorMessage(result.extensions!));

            return;
        }

        const createdUser: UserViewModel | null = await qUserService
            .findUser(result.data!);

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