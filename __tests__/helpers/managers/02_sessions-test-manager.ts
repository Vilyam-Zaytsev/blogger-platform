import {Response} from "supertest";
import {req} from "../test-helpers";
import {SETTINGS} from "../../../src/common/settings";
import {LoginSuccessViewModel} from "../../../src/01-auth/types/login-success-view-model";
import {presets} from "../datasets-for-tests";
import {UserInputModel} from "../../../src/03-users/types/input-output-types";

const sessionsTestManager = {

    async getActiveSessions() {

        const res: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${presets.authTokens[0].refreshToken}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        return res.body;
    }
};

export {sessionsTestManager};