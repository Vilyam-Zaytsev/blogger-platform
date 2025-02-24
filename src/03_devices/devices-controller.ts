import {Request, Response} from "express";
import {RequestWithSession} from "../common/types/input-output-types/request-types";
import {TokenSessionDataType} from "../02-sessions/types/token-session-data-type";
import {SETTINGS} from "../common/settings";


const devicesController = {

    getDevices: async (
        req: RequestWithSession<TokenSessionDataType>,
        res: Response
    ) => {

        const deviceId = req.session!.deviceId;

        if (!deviceId) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
        }


    },

    deleteDevices: async (
        req: Request,
        res: Response
    ) => {


    },

    deleteDevice: async (
        req: Request,
        res: Response
    ) => {


    }
};

export {devicesController};