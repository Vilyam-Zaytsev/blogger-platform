import {Response} from "supertest";
import {req} from "../test-helpers";
import {SETTINGS} from "../../../src/common/settings";
import {LoginSuccessViewModel} from "../../../src/01-auth/types/login-success-view-model";
import {presets} from "../datasets-for-tests";
import {UserInputModel} from "../../../src/04-users/types/input-output-types";

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

            expect(res.body).toEqual<LoginSuccessViewModel>(
                expect.objectContaining({
                    accessToken: expect.any(String)
                })
            );

            const authTokens = {
                accessToken: res.body.accessToken,
                refreshToken: res.headers['set-cookie'][0].split(';')[0].split('=')[1]
            }

            presets.authTokens.push({...authTokens});

            responses.push(res);
        }

        return responses;
    },

    async registration(userData: UserInputModel) {

        const res: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
            .send({
                login: userData.login,
                email: userData.email,
                password: userData.password
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        return res;
    },

    async refreshToken(refreshToken: string) {

        const res: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REFRESH_TOKEN}`)
            .set('Cookie', [`refreshToken=${presets.authTokens[0].refreshToken}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        presets.authTokens[0] = {
            ...res.body,
            refreshToken: res.headers['set-cookie'][0].split(';')[0].split('=')[1]
        };

        return res;
    }
};

export {authTestManager};