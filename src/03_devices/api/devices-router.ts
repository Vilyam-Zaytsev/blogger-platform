import {Router} from "express";
import {SETTINGS} from "../../common/settings";
import {devicesController} from "../devices-controller";
import {refreshTokenGuard} from "../../01-auth/api/guards/refresh-token-guard";

const devicesRouter = Router();

devicesRouter.get(
    SETTINGS.PATH.SECURITY_DEVICES.DEVICES,
    refreshTokenGuard,
    devicesController.getDevices
);
devicesRouter.delete(
    SETTINGS.PATH.SECURITY_DEVICES.DEVICES,
    refreshTokenGuard,
    devicesController.deleteDevices
);
devicesRouter.delete(
    `${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}/:id`,
    devicesController.deleteDevice
);

export {devicesRouter};