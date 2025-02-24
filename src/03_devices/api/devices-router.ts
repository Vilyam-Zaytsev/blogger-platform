import {Router} from "express";
import {SETTINGS} from "../../common/settings";

const devicesRouter = Router();

devicesRouter.get(SETTINGS.PATH.SECURITY_DEVICES.DEVICES);
devicesRouter.delete(SETTINGS.PATH.SECURITY_DEVICES.DEVICES);
devicesRouter.delete(`${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}/:id`);