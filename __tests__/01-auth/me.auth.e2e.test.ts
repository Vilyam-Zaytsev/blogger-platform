import {console_log_e2e, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    clearPresets,
    incorrectAccessToken,
    presets
} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {sessionsCollection, setSessionsCollection, setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/04-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";

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
