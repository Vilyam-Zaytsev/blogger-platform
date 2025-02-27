import {console_log_e2e, delay, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets, userLogins} from "../helpers/datasets-for-tests";
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

describe('UPDATE ACTIVE SESSION /security/devices', () => {

    it('should update the active session if the user has received a new pair of tokens.', async () => {

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const activeSessions_1: DeviceViewModel[] = await sessionsTestManager
            .getActiveSessions();

        await delay(4500);

        await authTestManager
            .refreshToken(presets.authTokens[0].refreshToken)

        const activeSessions_2: DeviceViewModel[] = await sessionsTestManager
            .getActiveSessions();

        expect(activeSessions_1).not.toStrictEqual(activeSessions_2);

        console_log_e2e(activeSessions_2, SETTINGS.HTTP_STATUSES.OK_200, 'Test 1: update active' +
            ' session(/security/devices)');
    });
});
