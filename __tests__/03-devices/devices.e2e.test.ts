import {console_log_e2e, delay, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, devices, presets, userLogins} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {sessionsCollection, setSessionsCollection, setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/04-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";
import {authService} from "../../src/01-auth/domain/auth-service";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {DeviceViewModel} from "../../src/02-sessions/types/input-output-types";
import {sessionsTestManager} from "../helpers/managers/02_sessions-test-manager";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

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

describe('DEVICES /security/devices', () => {

    it('should return an array with active sessions if the user is logged in.', async () => {

        await usersTestManager
            .createUser(2);

        for (let i = 0; i < devices.length; i++) {

            const res: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .set("User-Agent", devices[i])
                .send({
                    loginOrEmail: presets.users[0].login,
                    password: presets.users[0].login
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
            };

            presets.authTokens.push({...authTokens});
        }

        const createdDevices: DeviceViewModel[] = await sessionsTestManager
            .getActiveSessions();

        expect(createdDevices.length).toEqual(4);

        presets.devices = [...createdDevices];

        //GET: it should return a 401 if the refreshToken has failed validation.

        const resGetDevices: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        console_log_e2e(resGetDevices.body, resGetDevices.status, 'Test 1: get devices(/security/devices)');

        //DELETE (all devices except the current one): it should return a 401 if the refreshToken has failed validation.

        const resDeleteDevices: Response = await req
            .delete(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        console_log_e2e(resDeleteDevices.body, resDeleteDevices.status, 'Test 2: delete devices(/security/devices)');

        //DELETE (by deviceId): it should return a 401 if the refreshToken has failed validation.

        await delay(1000);

        const resDeleteDevice_Test3: Response = await req
            .delete(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}/${presets.devices[0].deviceId}`)
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        console_log_e2e(resDeleteDevice_Test3.body, resDeleteDevice_Test3.status, 'Test 3: delete device by ID(/security/devices)');

        //DELETE (by deviceId): it should return the value 403 if the device does not belong to the user.

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .set("User-Agent", devices[0])
            .send({
                loginOrEmail: presets.users[1].login,
                password: presets.users[1].login
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resLogin.body).toEqual<LoginSuccessViewModel>(
            expect.objectContaining({
                accessToken: expect.any(String)
            })
        );

        const authTokens = {
            accessToken: resLogin.body.accessToken,
            refreshToken: resLogin.headers['set-cookie'][0].split(';')[0].split('=')[1]
        };

        presets.authTokens.push({...authTokens});

        const resGetDevices_Test4: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${presets.authTokens[4].refreshToken}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const deviceId: string = resGetDevices_Test4.body[0].deviceId;

        const resDeleteDevice_Test4: Response = await req
            .delete(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}/${deviceId}`).set('Cookie', [`refreshToken=${presets.authTokens[0].refreshToken}`])
            .expect(SETTINGS.HTTP_STATUSES.FORBIDDEN_403);

        console_log_e2e(resDeleteDevice_Test4.body, resDeleteDevice_Test4.status, 'Test 4: delete device by' +
            ' ID(/security/devices)');

    });
});
