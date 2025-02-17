import {blackListCollection} from "../db/mongoDb";
import {BlacklistedTokenModel} from "./types/blacklisted-token-model";

const authRepository = {

    async addTokenToBlacklist(revokedToken: BlacklistedTokenModel) {

        return await blackListCollection
            .insertOne(revokedToken);
    },

    async isRefreshTokenBlacklisted(refreshToken: string): Promise<BlacklistedTokenModel | null> {

        return await blackListCollection
            .findOne({refreshToken});
    }
}

export {authRepository};