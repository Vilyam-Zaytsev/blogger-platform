import {blackListCollection} from "../db/mongoDb";
import {SessionModel} from "../02-sessions/types/session-model";

const authRepository = {

    async addTokenToBlacklist(revokedToken: SessionModel) {

        return await blackListCollection
            .insertOne(revokedToken);
    },

    async isRefreshTokenBlacklisted(refreshToken: string): Promise<SessionModel | null> {

        return await blackListCollection
            .findOne({refreshToken});
    }
}

export {authRepository};