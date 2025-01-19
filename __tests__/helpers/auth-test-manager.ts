import {Response} from "supertest";
import {req} from "./test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {AccessTokenType} from "../../src/01-auth/types/access-token-type";
import {presets} from "./datasets-for-tests";

const authTestManager = {
    async login(logins: string[]) {
        const responses: Response[] = [];

        for (let i = 0; i < logins.length; i++) {
            const res: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({
                    loginOrEmail: logins[i],
                    password: logins[i]
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res.body).toEqual<AccessTokenType>(
                expect.objectContaining({
                    accessToken: expect.any(String)
                })
            );

            presets.accessTokens.push(res.body);

            responses.push(res);
        }

        return responses;
    }
};

export {authTestManager};