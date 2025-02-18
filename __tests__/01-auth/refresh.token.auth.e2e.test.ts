import {console_log_e2e, delay, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {blackListCollection, setBlackListCollection, setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/02-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {BlacklistedTokenModel} from "../../src/01-auth/types/blacklisted-token-model";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setUsersCollection(db.collection<UserDbType>('users'));
    setBlackListCollection(db.collection<BlacklistedTokenModel>('blackList'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});
    await blackListCollection.deleteMany({});

    clearPresets();
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

        await delay(4000);

        let resRefreshToken = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REFRESH_TOKEN}`)
            .set('Cookie', [...cookies])
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        console_log_e2e(resRefreshToken.body, resRefreshToken.status, 'Test 2: post(/auth/refresh-token)');
    });
});
