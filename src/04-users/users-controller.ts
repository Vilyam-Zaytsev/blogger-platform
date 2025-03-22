import {Response} from "express";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../common/types/input-output-types/request-types";
import {
    PaginationAndSortFilterType,
    Paginator,
    SortingAndPaginationParamsType
} from "../common/types/input-output-types/pagination-sort-types";
import {UserInputModel, UserViewModel} from "./types/input-output-types";
import {UsersService} from "./application/users-service";
import {SETTINGS} from "../common/settings";
import {createPaginationAndSortFilter} from "../common/helpers/create-pagination-and-sort-filter";
import {ResultType} from "../common/types/result-types/result-type";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {mapResultExtensionsToErrorMessage} from "../common/helpers/map-result-extensions-to-error-message";
import {ApiErrorResult} from "../common/types/input-output-types/api-error-result";
import {IdType} from "../common/types/input-output-types/id-type";
import {UsersQueryRepository} from "./repositoryes/users-query-repository";
import {ResultStatus} from "../common/types/result-types/result-status";
import {injectable} from "inversify";
import {UserDocument, UserModel} from "./domain/user-entity";
import {UserDto} from "./domain/user-dto";
import {isSuccessfulResult} from "../common/helpers/type-guards";

@injectable()
class UsersController {

    constructor(
        private usersService: UsersService,
        private usersQueryRepository: UsersQueryRepository
    ) {};

    async getUsers(
        req: RequestWithQuery<SortingAndPaginationParamsType>,
        res: Response<Paginator<UserViewModel>>
    ){

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchLoginTerm: req.query.searchLoginTerm,
            searchEmailTerm: req.query.searchEmailTerm,
        };

        const paginationAndSortFilter: PaginationAndSortFilterType =
            createPaginationAndSortFilter(sortingAndPaginationParams);

        const foundUsers: UserViewModel[] = await this.usersQueryRepository
            .findUsers(paginationAndSortFilter);

        const usersCount: number = await this.usersQueryRepository
            .getUsersCount(
                paginationAndSortFilter.searchLoginTerm,
                paginationAndSortFilter.searchEmailTerm
                );

        const paginationResponse: Paginator<UserViewModel> = await this.usersQueryRepository
            ._mapUsersViewModelToPaginationResponse(
                foundUsers,
                usersCount,
                paginationAndSortFilter
            );

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(paginationResponse);
    }

    async createUser(
        req: RequestWithBody<UserInputModel>,
        res: Response<UserViewModel | ApiErrorResult>
    ){

        const {
            login,
            email,
            password
        } = req.body;

        const userDto: UserDto = new UserDto(login, email, password);

        const candidate: UserDocument = UserModel
            .createByAdmin(userDto);

        const {
            status: userCreationStatus,
            extensions: errorDetails,
            data: createdUserId
        }: ResultType<string | null> = await this.usersService
            .createUser(candidate);

        if (!isSuccessfulResult(userCreationStatus, createdUserId)) {
            res
                .status(mapResultStatusToHttpStatus(userCreationStatus))
                .json(mapResultExtensionsToErrorMessage(errorDetails));

            return;
        }

        const createdUser: UserViewModel | null = await this.usersQueryRepository
            .findUser(createdUserId);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdUser!);
    }

    async deleteUser(
        req: RequestWithParams<IdType>,
        res: Response
    ){

        const isDeletedUser: boolean = await this.usersService
            .deleteUser(req.params.id);

        if (!isDeletedUser) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }
}

export {UsersController};




