import {IdType} from "./id-type";
import {TokenSessionDataType} from "../../../02-sessions/types/token-session-data-type";

declare global {
    namespace Express {
        export interface Request {
            user?: IdType;
            session?: TokenSessionDataType
        }
    }
}