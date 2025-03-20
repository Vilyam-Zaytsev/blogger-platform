import {Response} from "express";
import {RequestWithParams, RequestWithSession} from "../common/types/input-output-types/request-types";
import {TokenSessionDataType} from "./types/token-session-data-type";
import {SETTINGS} from "../common/settings";
import {DeviceViewModel} from "./types/input-output-types";
import {SessionsQueryRepository} from "./repositories/sessions-query-repository";
import {ResultType} from "../common/types/result-types/result-type";
import {SessionsService} from "./application/sessions-service";
import {ResultStatus} from "../common/types/result-types/result-status";
import {IdType} from "../common/types/input-output-types/id-type";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";

@injectable()
class SessionsController {

    constructor(
        private sessionsService: SessionsService,
        private sessionsQueryRepository: SessionsQueryRepository,
    ) {}

    async getDevices(
        req: RequestWithSession<TokenSessionDataType>,
        res: Response<DeviceViewModel[]>
    ){

        const userId: string = req.session!.userId;

        if (!userId) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            return;
        }

        const devicesActiveSessions: DeviceViewModel[] = await this.sessionsQueryRepository
            .findSessionsByUserId(userId);

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(devicesActiveSessions);
    }

    async deleteDevices(
        req: RequestWithSession<TokenSessionDataType>,
        res: Response
    ){

        const {
            userId,
            deviceId
        } = req.session!;

        const resultDeleteSessions: boolean = await this.sessionsService
            .deleteAllSessionsExceptCurrent(userId, deviceId);

        if (!resultDeleteSessions) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }

    async deleteDevice(
        req: RequestWithParams<IdType>,
        res: Response
    ){

        const deviceId: ObjectId = new ObjectId(req.params.id);
        const userId: string = req.session!.userId

        const {
            status: sessionDeletionStatus
        }: ResultType = await this.sessionsService
            .deleteSessionByDeviceId(userId, deviceId);

        if (sessionDeletionStatus !== ResultStatus.Success) {

            res
                .sendStatus(mapResultStatusToHttpStatus(sessionDeletionStatus));

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }
}

export {SessionsController};