import {console_log_e2e, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, incorrectAccessToken, presets} from "../helpers/datasets-for-tests";
import {MongoClient} from "mongodb";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import mongoose from "mongoose";

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

    describe('GET /auth/me', () => {

        it('should return information about the user if the user is logged in (sends a valid access token).', async () => {

            await usersTestManager
                .createUser(1);

            await authTestManager
                .login(presets.users.map(u => u.login));

            const resMe: Response = await req
                .get(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.ME}`)
                .set(
                    'Authorization',
                    `Bearer ${presets.authTokens[0].accessToken}`
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resMe.body).toEqual(
                expect.objectContaining({
                    email: presets.users[0].email,
                    login: presets.users[0].login,
                    userId: presets.users[0].id
                })
            );

            console_log_e2e(resMe.body, resMe.status, 'Test 1: get(/auth/me)');
        });

        it('should return a 401 error if the user is logged in (sending an invalid access token).', async () => {

            await usersTestManager
                .createUser(1);

            await authTestManager
                .login(presets.users.map(u => u.login));

            const resMe: Response = await req
                .get(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.ME}`)
                .set(
                    'Authorization',
                    incorrectAccessToken
                )
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            console_log_e2e(resMe.body, resMe.status, 'Test 2: get(/auth/me)');
        });
    });
