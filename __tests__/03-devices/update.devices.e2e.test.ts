import {console_log_e2e, delay, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, deviceNames, presets} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {
    apiTrafficCollection,
    sessionsCollection,
    setApiTrafficCollection,
    setSessionsCollection,
    setUsersCollection,
    usersCollection
} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/04-users/types/confirmation-status";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";
import {DeviceViewModel} from "../../src/02-sessions/types/input-output-types";
import {ApiTrafficType} from "../../src/common/types/api-traffic-type";

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
    setApiTrafficCollection(db.collection<ApiTrafficType>('api-traffic'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});
    await sessionsCollection.deleteMany({});
    await apiTrafficCollection.deleteMany({});

    clearPresets();
});

describe('UPDATE /security/devices', () => {

    it('should update the lifetime of active sessions on different devices if the user has logged in.', async () => {

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

            await delay(10000);
        }

        //update refreshTokens user1 /*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/

        const refreshToken_user1_device1: string = resLogins.resLogins_user1[0].headers['set-cookie'][0].split(';')[0].split('=')[1];

        const resGetDevices_user1: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_user1_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        for (let i = 0; i < resLogins.resLogins_user1.length; i++) {

            await delay(1000);

            const refreshToken: string = resLogins.resLogins_user1[i].headers['set-cookie'][0].split(';')[0].split('=')[1];

            const resRefreshToken: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REFRESH_TOKEN}`)
                .set('Cookie', [`refreshToken=${refreshToken}`])
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            const resGetDevices: Response = await req
                .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
                .set('Cookie', [`refreshToken=${resRefreshToken.headers['set-cookie'][0].split(';')[0].split('=')[1]}`])
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGetDevices.body[i].lastActiveDate).not.toEqual(resGetDevices_user1.body[i].lastActiveDate)

            for (let j = i + 1; j < resGetDevices_user1.body.length; j++) {

                expect(resGetDevices.body[j].lastActiveDate).toEqual(resGetDevices_user1.body[j].lastActiveDate);
            }
        }

        //update refreshTokens user2 /*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/

        const refreshToken_user2_device1: string = resLogins.resLogins_user2[0].headers['set-cookie'][0].split(';')[0].split('=')[1];

        const resGetDevices_user2: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${refreshToken_user2_device1}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        for (let i = 0; i < resLogins.resLogins_user2.length; i++) {

            await delay(1000);

            const refreshToken: string = resLogins.resLogins_user2[i].headers['set-cookie'][0].split(';')[0].split('=')[1];

            const resRefreshToken: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REFRESH_TOKEN}`)
                .set('Cookie', [`refreshToken=${refreshToken}`])
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            const resGetDevices: Response = await req
                .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
                .set('Cookie', [`refreshToken=${resRefreshToken.headers['set-cookie'][0].split(';')[0].split('=')[1]}`])
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGetDevices.body[i].lastActiveDate).not.toEqual(resGetDevices_user2.body[i].lastActiveDate)

            for (let j = i + 1; j < resGetDevices_user2.body.length; j++) {

                expect(resGetDevices.body[j].lastActiveDate).toEqual(resGetDevices_user2.body[j].lastActiveDate);
            }
        }

        console_log_e2e('No Body', 200, 'Test 1: update (/security/devices)');
    }, 30000);
});
