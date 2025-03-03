import {console_log_e2e, delay, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, deviceNames, presets} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {sessionsCollection, setSessionsCollection, setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/04-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";
import {DeviceViewModel} from "../../src/02-sessions/types/input-output-types";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

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
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

    setUsersCollection(db.collection<UserDbType>('users'));
    setSessionsCollection(db.collection<ActiveSessionType>('sessions'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});
    await sessionsCollection.deleteMany({});

    clearPresets();
});

describe('DELETE /security/devices', () => {

    it('should delete all active sessions except the current one if the user is logged in.', async () => {

        await usersTestManager
            .createUser(1);

        const resLogins: Response[] = [];

        for (let i = 0; i < presets.users.length; i++) {

            for (let j = 0; j < deviceNames.length; j++) {

                await delay(1000);

                const res: Response = await req
                    .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                    .set("User-Agent", deviceNames[j])
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

                resLogins.push(res);
            }
        }

        //delete devices /*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/

        const refreshToken_device1: string = resLogins[0].headers['set-cookie'][0].split(';')[0].split('=')[1];

        const resGetDevices1: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices1.body.length).toEqual(4);

        const resDeleteDevices: Response = await req
            .delete(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const resGetDevices2: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices2.body.length).toEqual(1);

        expect(resGetDevices1.body[0]).toEqual(resGetDevices2.body[0]);

        console_log_e2e(resDeleteDevices.body, resDeleteDevices.status, 'Test 1: delete (/security/devices)');
    });

    it('should not delete all active sessions except the current one if the user is not logged in.', async () => {

        await usersTestManager
            .createUser(1);

        const resLogins: Response[] = [];

        for (let i = 0; i < presets.users.length; i++) {

            for (let j = 0; j < deviceNames.length; j++) {

                await delay(1000);

                const res: Response = await req
                    .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                    .set("User-Agent", deviceNames[j])
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

                resLogins.push(res);
            }
        }

        //delete devices /*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/

        const refreshToken_device1: string = resLogins[0].headers['set-cookie'][0].split(';')[0].split('=')[1];

        const resGetDevices1: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices1.body.length).toEqual(4);

        const resDeleteDevices: Response = await req
            .delete(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const resGetDevices2: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices2.body.length).toEqual(4);

        expect(resGetDevices1.body).toEqual(resGetDevices2.body);

        console_log_e2e(resDeleteDevices.body, resDeleteDevices.status, 'Test 2: delete (/security/devices)');
    });

    it('should delete a specific session by ID if the user is logged in.', async () => {

        await usersTestManager
            .createUser(1);

        const resLogins: Response[] = [];

        for (let i = 0; i < presets.users.length; i++) {

            for (let j = 0; j < deviceNames.length; j++) {

                await delay(1000);

                const res: Response = await req
                    .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                    .set("User-Agent", deviceNames[j])
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

                resLogins.push(res);
            }
        }

        //delete device by id /*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/

        const refreshToken_device1: string = resLogins[0].headers['set-cookie'][0].split(';')[0].split('=')[1];

        const resGetDevices1: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices1.body.length).toEqual(4);

        const id_device2: string = resGetDevices1.body[1].deviceId;

        const resDeleteDevice: Response = await req
            .delete(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}/${id_device2}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const resGetDevices2: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices2.body.length).toEqual(3);

        expect(resGetDevices2.body.some((d: { lastActiveDate: string }) => d.lastActiveDate === resGetDevices1.body[1].lastActiveDate)).toBe(false);

        console_log_e2e(resDeleteDevice.body, resDeleteDevice.status, 'Test 3: delete (/security/devices/:id)');
    });

    it('should not delete a specific session of a specific user if the user is logged in.', async () => {

        await usersTestManager
            .createUser(1);

        const resLogins: Response[] = [];

        for (let i = 0; i < presets.users.length; i++) {

            for (let j = 0; j < deviceNames.length; j++) {

                await delay(1000);

                const res: Response = await req
                    .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                    .set("User-Agent", deviceNames[j])
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

                resLogins.push(res);
            }
        }

        //delete device by id /*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/

        const refreshToken_device1: string = resLogins[0].headers['set-cookie'][0].split(';')[0].split('=')[1];

        const resGetDevices1: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices1.body.length).toEqual(4);

        const id_device2: string = resGetDevices1.body[1].deviceId;

        const resDeleteDevice: Response = await req
            .delete(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}/${id_device2}`)
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const resGetDevices2: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices2.body.length).toEqual(4);

        expect(resGetDevices1.body).toEqual(resGetDevices2.body);

        console_log_e2e(resDeleteDevice.body, resDeleteDevice.status, 'Test 4: delete (/security/devices/:id)');
    });

    it('should not delete a specific session of a specific user if the user is not the owner of this device.', async () => {

        await usersTestManager
            .createUser(2);

        const resLogins: Record<string, Response[]> = {
            resLogins_user1: [],
            resLogins_user2: []
        };

        for (let i = 0; i < presets.users.length; i++) {

            for (let j = 0; j < deviceNames.length; j++) {

                const res: Response = await req
                    .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                    .set("User-Agent", deviceNames[j])
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

                resLogins[`resLogins_user${i + 1}`].push(res);
            }
        }

        //delete device by id /*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/

        const refreshToken_user1_device1: string = resLogins.resLogins_user1[0].headers['set-cookie'][0].split(';')[0].split('=')[1];
        const refreshToken_user2_device1: string = resLogins.resLogins_user2[0].headers['set-cookie'][0].split(';')[0].split('=')[1];

        const resGetDevices_user2: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_user2_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const id_device1_user2: string = resGetDevices_user2.body[0].deviceId;

        const resDeleteDevice: Response = await req
            .delete(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}/${id_device1_user2}`)
            .set('Cookie', [`refreshToken=${refreshToken_user1_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.FORBIDDEN_403);

        const resGetDevices_user2_2: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_user2_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices_user2_2.body.length).toEqual(4);

        expect(resGetDevices_user2.body).toEqual(resGetDevices_user2_2.body);

        console_log_e2e(resDeleteDevice.body, resDeleteDevice.status, 'Test 5: delete (/security/devices/:id)');
    });

    it('should not delete a specific session of a specific user if no such session exists.', async () => {

        await usersTestManager
            .createUser(1);

        const resLogins: Response[] = [];

        for (let i = 0; i < presets.users.length; i++) {

            for (let j = 0; j < deviceNames.length; j++) {

                await delay(1000);

                const res: Response = await req
                    .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                    .set("User-Agent", deviceNames[j])
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

                resLogins.push(res);
            }
        }

        //delete device by id /*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/

        const refreshToken_device1: string = resLogins[0].headers['set-cookie'][0].split(';')[0].split('=')[1];

        const resGetDevices1: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices1.body.length).toEqual(4);

        const resDeleteDevice: Response = await req
            .delete(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}/${new ObjectId()}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const resGetDevices2: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetDevices2.body.length).toEqual(4);

        expect(resGetDevices1.body).toEqual(resGetDevices2.body);

        console_log_e2e(resDeleteDevice.body, resDeleteDevice.status, 'Test 6: delete (/security/devices/:id)');
    });


});
