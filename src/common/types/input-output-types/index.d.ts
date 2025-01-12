import {IdType} from "./id-type";

declare global {
    namespace Express {
        export interface Request {
            user?: IdType;
        }
    }
}