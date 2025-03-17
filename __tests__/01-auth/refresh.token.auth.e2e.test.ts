import {console_log_e2e, delay, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {MongoClient} from "mongodb";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import mongoose from "mongoose";

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

let client: MongoClient;

beforeAll(async () => {

    const uri = SETTINGS.MONGO_URL;

    if (!uri) {

        throw new Error("MONGO_URL is not defined in SETTINGS");
    }

    await runDb(uri);

    client = new MongoClient(uri);
    await client.connect();


});

afterAll(async () => {
    await mongoose.disconnect();
    await client.close();
});

beforeEach(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();

    await client.db(SETTINGS.DB_NAME).dropDatabase();

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

        await delay(4500);

        let resRefreshToken = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REFRESH_TOKEN}`)
            .set('Cookie', [...cookies])
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        console_log_e2e(resRefreshToken.body, resRefreshToken.status, 'Test 2: post(/auth/refresh-token)');
    }, 10000);
});
