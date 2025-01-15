import {Router} from "express";
import {testsController} from "./tests-controller";

const testsRouter = Router();

testsRouter.delete('/', testsController.deleteAllData);

export {testsRouter};