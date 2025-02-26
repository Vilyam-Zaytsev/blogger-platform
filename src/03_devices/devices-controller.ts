import {Request, Response} from "express";
import {RequestWithParams, RequestWithSession} from "../common/types/input-output-types/request-types";
import {TokenSessionDataType} from "../02-sessions/types/token-session-data-type";
import {SETTINGS} from "../common/settings";
import {DeviceViewModel} from "./types/input-output-types";
import {sessionsQueryRepository} from "../02-sessions/repositories/sessions-query-repository";
import {ResultType} from "../common/types/result-types/result-type";
import {sessionsService} from "../02-sessions/domain/sessions-service";
import {ResultStatus} from "../common/types/result-types/result-status";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {IdType} from "../common/types/input-output-types/id-type";


const devicesController = {

    getDevices: async (
        req: RequestWithSession<TokenSessionDataType>,
        res: Response<DeviceViewModel[]>
    ) => {

        const userId: string = req.session!.userId;

        if (!userId) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            return;
        }

        const devicesActiveSessions: DeviceViewModel[] = await sessionsQueryRepository
            .findSessionsByUserId(userId);

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(devicesActiveSessions);
    },

    deleteDevices: async (
        req: RequestWithSession<TokenSessionDataType>,
        res: Response
    ) => {

        const {
            userId,
            iat
        } = req.session!;

        const resultDeleteSessions: boolean = await sessionsService
            .deleteAllSessionsExceptCurrent(userId, iat);

        if (!resultDeleteSessions) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    },

    deleteDevice: async (
        req: RequestWithParams<IdType>,
        res: Response
    ) => {

        const deviceId: string = req.params.id;
        const userId: string = req.session!.userId

        const resultDeleteSession: boolean = await sessionsService
            .deleteSessionByUserIdAndDeviceId(userId, deviceId);

        if (!resultDeleteSession) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.FORBIDDEN_403);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }
};

export {devicesController};