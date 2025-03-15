import {Router} from "express";
import {SETTINGS} from "../../common/settings";
import {SessionsController} from "../sessions-controller";
import {refreshTokenGuard} from "../../01-auth/api/guards/refresh-token-guard";
import {container} from "../../composition-root";

const sessionsRouter = Router();
const sessionsController: SessionsController = container.get(SessionsController);

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