import {Router} from "express";
import {SETTINGS} from "../../common/settings";
import {SessionsController} from "../sessions-controller";
import {refreshTokenGuard} from "../../01-auth/api/guards/refresh-token-guard";

const sessionsController: SessionsController = new SessionsController();

const sessionsRouter = Router();

sessionsRouter.get(
    SETTINGS.PATH.SECURITY_DEVICES.DEVICES,
    refreshTokenGuard,
    sessionsController.getDevices
);
sessionsRouter.delete(
    SETTINGS.PATH.SECURITY_DEVICES.DEVICES,
    refreshTokenGuard,
    sessionsController.deleteDevices
);
sessionsRouter.delete(
    `${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}/:id`,
    refreshTokenGuard,
    sessionsController.deleteDevice
);

export {sessionsRouter};