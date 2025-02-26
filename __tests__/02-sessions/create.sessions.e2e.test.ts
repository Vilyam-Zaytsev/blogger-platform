import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {sessionsCollection, setSessionsCollection, setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/04-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";
import {authService} from "../../src/01-auth/domain/auth-service";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {DeviceViewModel} from "../../src/02-sessions/types/input-output-types";

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

describe('CREATE ACTIVE SESSION /security/devices', () => {

    it('should create a new active session when the user logs in.', async () => {

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resActiveSession_2: Response = await req
            .get(`${SETTINGS.PATH.SECURITY_DEVICES.BASE}${SETTINGS.PATH.SECURITY_DEVICES.DEVICES}`)
            .set('Cookie', [`refreshToken=${presets.authTokens[0].refreshToken}`])
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resActiveSession_2.body).toEqual<DeviceViewModel[]>(expect.objectContaining(
            [
                {
                    ip: expect.any(String),
                    title: expect.any(String),
                    lastActiveDate: expect.any(String),
                    deviceId: expect.any(String)
                }
            ]
        ));

        console_log_e2e(resActiveSession_2.body, resActiveSession_2.status, 'Test 1: create active' +
            ' session(/security/devices)');
    });
});
