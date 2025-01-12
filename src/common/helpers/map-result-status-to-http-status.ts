import {ResultStatusType} from "../types/result-types/result-status-type";
import {SETTINGS} from "../settings";

const mapResultStatusToHttpStatus = (resultStatus: ResultStatusType): number => {
    switch (resultStatus) {
        case ResultStatusType.Success:
            return SETTINGS.HTTP_STATUSES.OK_200;
        case ResultStatusType.Unauthorized:
            return SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401;
        case ResultStatusType.BadRequest:
            return SETTINGS.HTTP_STATUSES.BAD_REQUEST_400;
        default:
            return 1;
    }
};

export {mapResultStatusToHttpStatus};