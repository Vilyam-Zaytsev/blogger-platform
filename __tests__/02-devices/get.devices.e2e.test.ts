import {console_log_e2e, delay, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, deviceNames, presets} from "../helpers/datasets-for-tests";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {DeviceViewModel} from "../../src/02-sessions/types/input-output-types";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import mongoose from "mongoose";

jest.mock('../../src/common/settings', () => {
    const actualSettings = jest.requireActual('../../src/common/settings').SETTINGS;
    return {
        SETTINGS: {
            ...actualSettings,
            JWT_EXPIRATION_AT: '50s',
            JWT_EXPIRATION_RT: '60s',
        },
    };
});

beforeAll(async () => {

    const uri = SETTINGS.MONGO_URL;

    if (!uri) {

        throw new Error("MONGO_URL is not defined in SETTINGS");
    }

    await runDb(uri);
});

afterAll(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();

    clearPresets();
});

beforeEach(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();

    clearPresets();
});

describe('GET /security/devices', () => {

    it('should return an array with one device if the user is logged in on only one device.', async () => {

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resGetDevices: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${presets.authTokens[0].refreshToken}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices.body.length).toEqual(1);

        expect(resGetDevices.body).toEqual<DeviceViewModel[]>(
            [
                {
                    ip: expect.any(String),
                    title: expect.any(String),
                    lastActiveDate: expect.any(String),
                    deviceId: expect.any(String)
                }
            ]
        );

        console_log_e2e(resGetDevices.body, resGetDevices.status, 'Test 1: get (/security/devices)');
    });

    it('should return an array with four devices if the user is logged in on four different devices.', async () => {

        await usersTestManager
            .createUser(1);

        for (let i = 0; i < deviceNames.length; i++) {

            const res: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .set("User-Agent", deviceNames[i])
                .send({
                    loginOrEmail: presets.users[0].login,
                    password: presets.users[0].login
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res.body).toEqual<LoginSuccessViewModel>(
                {
                    accessToken: expect.any(String)
                }
            );

            const authTokens = {
                accessToken: res.body.accessToken,
                refreshToken: res.headers['set-cookie'][0].split(';')[0].split('=')[1]
            };

            presets.authTokens.push({...authTokens});
        }

        const resGetDevices: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${presets.authTokens[0].refreshToken}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices.body.length).toEqual(4);

        for (let i = 0; i < resGetDevices.body.length; i++) {

            expect(resGetDevices.body[i]).toEqual<DeviceViewModel>(
                {
                    ip: expect.any(String),
                    title: expect.any(String),
                    lastActiveDate: expect.any(String),
                    deviceId: expect.any(String)
                }
            );
        }

        console_log_e2e(resGetDevices.body, resGetDevices.status, 'Test 2: get (/security/devices)');
    });

    it('should return an array with devices of only the user who makes the request.', async () => {

        await usersTestManager
            .createUser(2);

        for (let i = 0; i < presets.users.length; i++) {

            for (let j = 0; j < deviceNames.length; j++) {

                const res: Response = await req
                    .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                    .set("User-Agent", deviceNames[i])
                    .send({
                        loginOrEmail: presets.users[i].login,
                        password: presets.users[i].login
                    })
                    .expect(SETTINGS.HTTP_STATUSES.OK_200);

                expect(res.body).toEqual<LoginSuccessViewModel>(
                    {
                        accessToken: expect.any(String)
                    }
                );

                const authTokens = {
                    accessToken: res.body.accessToken,
                    refreshToken: res.headers['set-cookie'][0].split(';')[0].split('=')[1]
                };

                presets.authTokens.push({...authTokens});
            }

            await delay(10000);
        }

        const resGetDevices_user1: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${presets.authTokens[0].refreshToken}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices_user1.body.length).toEqual(4);

        for (let i = 0; i < resGetDevices_user1.body.length; i++) {

            expect(resGetDevices_user1.body[i]).toEqual<DeviceViewModel>(
                {
                    ip: expect.any(String),
                    title: expect.any(String),
                    lastActiveDate: expect.any(String),
                    deviceId: expect.any(String)
                }
            );
        }

        const resGetDevices_user2: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${presets.authTokens[1].refreshToken}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices_user2.body.length).toEqual(4);

        for (let i = 0; i < resGetDevices_user2.body.length; i++) {

            expect(resGetDevices_user2.body[i]).toEqual<DeviceViewModel>(
                {
                    ip: expect.any(String),
                    title: expect.any(String),
                    lastActiveDate: expect.any(String),
                    deviceId: expect.any(String)
                }
            );
        }

        expect(resGetDevices_user1).not.toEqual(resGetDevices_user2);

        console_log_e2e(resGetDevices_user1.body, resGetDevices_user1.status, 'Test 3: get (/security/devices)');
    }, 30000);
});
