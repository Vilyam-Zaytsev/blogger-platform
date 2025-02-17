import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {presets} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {blackListCollection, setBlackListCollection, setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/02-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
import {BlacklistedTokenModel} from "../../src/01-auth/types/blacklisted-token-model";

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

    presets.users = [];
});

describe('POST /auth/refresh-token', () => {

    it('should return a new pair of Access and Refresh tokens if the Refresh token sent by the user is still valid.', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: presets.users[0].login,
                password: presets.users[0].login
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resLogin.body).toEqual<LoginSuccessViewModel>(
            expect.objectContaining({
                accessToken: expect.any(String)
            })
        );

        expect(resLogin.headers['set-cookie']).toBeDefined();
        expect(resLogin.headers['set-cookie'][0]).toMatch(/refreshToken=.*;/);

        console_log_e2e(resLogin.body, resLogin.status, 'Test 1: post(/auth/login)');
    });
});
