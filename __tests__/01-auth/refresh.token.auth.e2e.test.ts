import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {blackListCollection, setBlackListCollection, setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/02-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
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

        const authTokens1 = {
            ...resLogin[0].body,
            refreshToken: resLogin[0].headers['set-cookie'][0].split(';')[0].split('=')[1]
        }

        console.log('TEST LOGIN:', authTokens1)//********************************

        const cookies = resLogin[0].headers['set-cookie'];

        const resRefreshToken: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REFRESH_TOKEN}`)
            .set('Cookie', [...cookies])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const authTokens2 = {
            ...resRefreshToken.body,
            refreshToken: resRefreshToken.headers['set-cookie'][0].split(';')[0].split('=')[1]
        }

        // expect(presets.authTokens[0]).not.toEqual(authTokens);

        console.log('TEST REFRESH(RESPONSE):', authTokens2)
        console.log('TEST REFRESH(PRESETS):', presets.authTokens[0])

        // console_log_e2e(resLogin.body, resLogin.status, 'Test 1: post(/auth/login)');
    });
});
