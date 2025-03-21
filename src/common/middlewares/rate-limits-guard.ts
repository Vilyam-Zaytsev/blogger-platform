import {NextFunction, Request, Response} from "express";
import {SETTINGS} from "../settings";
import {ApiTrafficModel} from "../../archive/models/api-traffic-model";

const rateLimitsGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const ip: string = req.headers['x-forwarded-for']?.toString().split(',')[0]
        || req.socket.remoteAddress
        || '0.0.0.0';

    const url: string = req.originalUrl;

    const date: Date = new Date();

    const filter = {
        ip,
        url,
        date: {$gte: new Date(date.getTime() - 10 * 1000).toISOString()}
    };

    await ApiTrafficModel
        .create({
            ip,
            url,
            date
        });

    const recentRequestCount: number = await ApiTrafficModel
        .countDocuments(filter)
        .exec();

    console.log(recentRequestCount)

    if (recentRequestCount > 5) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.TOO_MANY_REQUESTS_429);

        return;
    }

    next();
};

export {rateLimitsGuard};