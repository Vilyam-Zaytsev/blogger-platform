import {console_log_e2e, delay, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
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
import {UserDbType} from "../../src/04-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {ApiTrafficType} from "../../src/common/types/api-traffic-type";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

jest.mock('../../src/common/settings', () => {
    const actualSettings = jest.requireActual('../../src/common/settings').SETTINGS;
    return {
        SETTINGS: {
            ...actualSettings,
            JWT_EXPIRATION_AT: '2s',
            JWT_EXPIRATION_RT: '4s',
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

    jest.resetModules();
});

describe('POST /auth/refresh-token', () => {

    it('should return a new pair of Access and Refresh tokens if the Refresh token sent by the user is still valid.', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response[] = await authTestManager
            .login(presets.users.map(u => u.login));

        const cookies = resLogin[0].headers['set-cookie'];

        await delay(1000);

        const resRefreshToken: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REFRESH_TOKEN}`)
            .set('Cookie', [...cookies])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const authTokens = {
            ...resRefreshToken.body,
            refreshToken: resRefreshToken.headers['set-cookie'][0].split(';')[0].split('=')[1]
        };

        expect(presets.authTokens[0]).not.toEqual(authTokens);

        console_log_e2e(resRefreshToken.body, resRefreshToken.status, 'Test 1: post(/auth/login)');
    });

    it('should not return a new pair of access and upgrade tokens if the Refresh token sent by the user is expired.', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response[] = await authTestManager
            .login(presets.users.map(u => u.login));

        const cookies = resLogin[0].headers['set-cookie'];

        await delay(4500);

        let resRefreshToken = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REFRESH_TOKEN}`)
            .set('Cookie', [...cookies])
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        console_log_e2e(resRefreshToken.body, resRefreshToken.status, 'Test 2: post(/auth/refresh-token)');
    }, 10000);
});
