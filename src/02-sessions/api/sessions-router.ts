import {Router} from "express";
import {SETTINGS} from "../../common/settings";
import {sessionsController} from "../sessions-controller";
import {refreshTokenGuard} from "../../01-auth/api/guards/refresh-token-guard";

const sessionsRouter = Router();

sessionsRouter.get(
    SETTINGS.PATH.SECURITY_DEVICES.DEVICES,
    refreshTokenGuard,
    sessionsController.getDevices.bind(sessionsController)
);
sessionsRouter.delete(
    SETTINGS.PATH.SECURITY_DEVICES.DEVICES,
    refreshTokenGuard,
    sessionsController.deleteDevices.bind(sessionsController)
);
sessionsRouter.delete(
    `${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}/:id`,
    refreshTokenGuard,
    sessionsController.deleteDevice.bind(sessionsController)
);

export {sessionsRouter};