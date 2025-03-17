import {NextFunction, Request, Response} from "express";
import {apiTrafficCollection} from "../../db/mongo-db/mongoDb";
import {SETTINGS} from "../settings";

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

    const recentRequestCount: number = await apiTrafficCollection
        .countDocuments(filter);

    if (recentRequestCount >= 5) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.TOO_MANY_REQUESTS_429);

        return;
    }

    await apiTrafficCollection
        .insertOne({
            ip,
            url,
            date: date.toISOString()
        });

    next();
};

export {rateLimitsGuard};