import {ResultStatus} from "../types/result-types/result-status";
import {SETTINGS} from "../settings";

const mapResultStatusToHttpStatus = (resultStatus: ResultStatus): number => {
    switch (resultStatus) {
        case ResultStatus.Success:
            return SETTINGS.HTTP_STATUSES.OK_200;
        case ResultStatus.Created:
            return SETTINGS.HTTP_STATUSES.CREATED_201;
        case ResultStatus.BadRequest:
            return SETTINGS.HTTP_STATUSES.BAD_REQUEST_400;
        case ResultStatus.Unauthorized:
            return SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401;
        case ResultStatus.Forbidden:
            return SETTINGS.HTTP_STATUSES.FORBIDDEN_403;
        case ResultStatus.NotFound:
            return SETTINGS.HTTP_STATUSES.NOT_FOUND_404;
        case ResultStatus.InternalServerError:
            return SETTINGS.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500;
        default:
            return 1;
    }
};

export {mapResultStatusToHttpStatus};