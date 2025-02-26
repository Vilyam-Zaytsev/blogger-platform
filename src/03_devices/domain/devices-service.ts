import {DeviceViewModel} from "../types/input-output-types";
import {sessionsQueryRepository} from "../../02-sessions/repositories/sessions-query-repository";

const devicesService = {

    async getDevicesByUserId(userId: string) {

        const devicesActiveSessions: DeviceViewModel[] = await sessionsQueryRepository
            .findSessionsByUserId(userId);


    }
}